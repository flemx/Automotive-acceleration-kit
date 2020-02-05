Webruntime.moduleRegistry.define('force/lds', ['exports', 'assert', 'lwc', 'logger', 'aura', 'wire-service', 'instrumentation/service'], function (exports, assert, lwc, logger, aura, wireService, service) { 'use strict';

    assert = assert && assert.hasOwnProperty('default') ? assert['default'] : assert;

    /* LDS has proxy compat enabled */

    /*
     * Contains general utility functions around types.
     */
    class TypeUtils {
      /*
       * Returns true if the provided value is a function, else false.
       * @param value: any - The value with which to determine if it is a function.
       * @return : boolean - See description.
       */
      isFunction(value) {
        const type = typeof value;

        if (type === 'function') {
          return true;
        }

        return false;
      }
      /*
       * Returns true if the given value is a plain object, else false. A plain object has the following properties:
       * 1. Is not null
       * 2. Has a prototype with a constructor that is "Object".
       * @param value: any - The value with which to determine if it is a plain object.
       * @return : boolean - See description.
       */


      isPlainObject(value) {
        const objectProto = value !== null && typeof value === "object" && Object.getPrototypeOf(value);
        return value !== null && typeof value === "object" && (value.constructor && value.constructor.name === "Object" || objectProto && objectProto.constructor && objectProto.constructor.name === "Object");
      }
      /**
       * Checks whether the argument is a valid object
       * A valid object: Is not a DOM element, is not a native browser class (XMLHttpRequest)
       * is not falsey, and is not an array, error, function, string, or number.
       *
       * @param {Object} value The object to check for
       * @returns {Boolean} True if the value is an object and not an array, false otherwise
       */


      isObject(value) {
        return typeof value === "object" && value !== null && !this.isArray(value);
      }
      /**
       * Checks whether the specified object is an array.
       *
       * @param {Object} value The object to check for.
       * @returns {Boolean} True if the object is an array, or false otherwise.
       */


      isArray(value) {
        return Array.isArray(value);
      }
      /**
       * Checks if the object is of type string.
       *
       * @param {Object} value The object to check for.
       * @returns {Boolean} True if the object is of type string, or false otherwise.
       */


      isString(value) {
        return typeof value === 'string';
      }
      /**
       * Checks if the object is of type number.
       *
       * @param {Object} value The object to check for.
       * @returns {Boolean} True if the object is of type number, or false otherwise.
       */


      isNumber(value) {
        return typeof value === 'number';
      }
      /* WARNING: This must be used inside asserts only. If you are using this for class check for custom(non native) classes, then you must use an explicit check along with it.
       * e.g. thenables/Promises can be checked by using .then method
       * Returns true if the given value is an instance of the given type, else false. Unlike the built-in javascript instanceof operator, this
       * function treats cross frame/window instances as the same.
       * @param value: Object - The value with which to determine if it is of the given type.
       * @param type: Function - A constructor function to check the value against.
       * @return : boolean - See description.
       */


      isInstanceOf(value, type) {
        // Do native operation first. If it is true we don't need to do the cross frame algorithm. Adding this check results
        // in significant perf improvement when evaluating to true, and only a small perf decrease when evaluating to false.
        if (value instanceof type) {
          return true;
        } // Fallback to cross frame algorithm.


        if (type === null || type === undefined) {
          throw new Error("type must be defined");
        }

        if (!this.isFunction(type)) {
          throw new Error("type must be callable");
        }

        if (typeof type.prototype !== "object" && typeof type.prototype !== "function") {
          throw new Error("type has non-object prototype " + typeof type.prototype);
        }

        if (value === null || typeof value !== "object" && typeof value !== "function") {
          return false;
        }

        const prototypeOfValue = Object.getPrototypeOf(value); // There may be no prototype if an object is created with Object.create(null).

        if (prototypeOfValue) {
          if (prototypeOfValue.constructor.name === type.name) {
            return true;
          } else if (prototypeOfValue.constructor.name !== "Object") {
            // Recurse down the prototype chain.
            return this.isInstanceOf(prototypeOfValue, type);
          }
        } // No match!


        return false;
      }

    }
    /*
     * The singleton instance of the class.
     */


    const typeUtils = new TypeUtils();

    /* LDS has proxy compat enabled */
    class UsefulSet {
      constructor() {
        if (Object.getPrototypeOf(this).constructor !== UsefulSet) {
          throw new Error("UsefulSet is final and cannot be extended.");
        }

        Object.defineProperties(this, {
          delegateSet: {
            value: new Set(...arguments),
            writable: false
          }
        });
      } // Implement core Set methods


      get size() {
        return this.delegateSet.size;
      }

      add() {
        this.delegateSet.add(...arguments);
        return this; // chainable method
      }

      clear() {
        this.delegateSet.clear(...arguments);
      }

      delete() {
        return this.delegateSet.delete(...arguments);
      }

      entries() {
        return this.delegateSet.entries(...arguments);
      }

      forEach() {
        this.delegateSet.forEach(...arguments);
      }

      has() {
        return this.delegateSet.has(...arguments);
      }

      values() {
        return this.delegateSet.values(...arguments);
      }

      [Symbol.iterator]() {
        // Be iterable like the stock Set.
        return this.delegateSet.values();
      } // Implement extension methods to Set that make it more useful.

      /**
       * Check whether this set contains all specified values.
       * @param {Iterable} values - Iterable of values to see whether the set contains.
       * @return {boolean} true if set contains all values, else false
       */


      containsAll(values) {
        // TODO: use for...of w/ break once polyfill for it is supported.
        let containsAll = true;
        values.forEach(value => {
          if (!containsAll) {
            return;
          }

          if (!this.has(value)) {
            containsAll = false;
          }
        });
        return containsAll;
      }
      /**
       * Add all values to a this Set.
       * @param {Iterable} values - Iterable of values to add to set.
       * @returns {Object} this UsefulSet for chaining calls, like with add().
       */


      addAll(values) {
        values.forEach(value => {
          this.add(value);
        });
        return this;
      }
      /*
       * Return a new UsefulSet that contains all the values of this set combined with the values from the other set.
       * @param values: Iterable<?> - A collection of values to union with this set.
       * @returns UsefulSet<?> - A set of the values in this set that aren't also in the other set.
       */


      union(values) {
        const union = new UsefulSet(this);
        values.forEach(value => {
          union.add(value);
        });
        return union;
      }
      /**
       * Return any values in this set that aren't also in the other set.
       * @param {Iterable} values - Iterable of a collection of values to difference against this set.
       * @returns {Set} a set of the values in this set that aren't also in the other set.
       */


      difference(values) {
        const difference = new UsefulSet(this);
        values.forEach(value => {
          difference.delete(value);
        });
        return difference;
      }

    }

    /* LDS has proxy compat enabled */

    /* LDS has proxy compat enabled */

    /*
     * Thenable implements a function chain that mimics the Promise instance API and can degrade to being backed by Promises
     * if necessary. If no Promises are encountered in the chain this will result in better performance because it chains functions
     * without pushing anything into a future tick in the microtask queue, i.e. it can be synchronous. When Promises go into the
     * same microtask queue they can be slowed down by things already ahead of them in the queue. Using Thenables allows us to
     * be synchronous when we can and degrade to being asynchronous (Promises) when we must.
     *
     * Note that Thenables are a notion from the Promise spec, see section 2.3.3 in https://promisesaplus.com/
     *
     * Note also that Promises are interoperable with the Thenable concept -- they have a construtor to convert a Thenable to a
     * Promise as well as a static method to contruct a Promise from a Thenable. See:
     * <pre><code>
     * new Promise((resolve, reject) => {resolve(thenable);}); // (constructor)
     * Promise.resolve(thenable); // (static)
     * </code></pre>
     *
     * Note that with this Promise interoperability, Thenable works with async/await. E.g. just like you can do the following with
     * Promises:
     * <pre><code>
     * async function asyncFunc() {
     *     var value = await Promise.resolve(1)
     *         .then(x => x * 3)
     *         .then(await Promise.resolve(x => x + 5))
     *         .then(x => x / 2);
     *     return value;
     * }
     * asyncFunc().then(x => {console.log(`x: ${x}`); return x;});
     * // log output: x: 4
     * // result: Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: 4}
     * </code></pre>
     * you can also do the same thing with Thenable:
     * <pre><code>
     * async function asyncFunc() {
     *     var value = await Thenable.resolve(1)
     *         .then(x => x * 3)
     *         .then(await Thenable.resolve(x => x + 5))
     *         .then(x => x / 2);
     *     return value;
     * }
     * asyncFunc().then(x => {console.log(`x: ${x}`); return x;});
     * // log output: x: 4
     * // result: Promise {[[PromiseStatus]]: "resolved", [[PromiseValue]]: 4}
     * </code></pre>
     * While this interoperability with async/await may prove very handy when necessary, you should be careful using async/await
     * because once you do you will leave the synchronous chain of Thenables and start an asynchronous chain of Promises.
     */

    class Thenable {
      /*
       * Constructor.
       * @param value: any - The value that the thenable should resolve to.
       * @param rejectionReason: any - The rejection reason if the thenable rejects.
       */
      constructor(executor) {
        if (typeof executor != "function") {
          throw new Error("executor must be a function!");
        }

        this.value = undefined;
        this.rejectionReason = undefined; // This is expected to be synchronous.

        executor(this.resolver.bind(this), this.rejector.bind(this));
      }

      resolver(value) {
        this.value = value;
      }

      rejector(value) {
        this.rejectionReason = value;
      }
      /*
       * Returns a Thenable that is resolved with the provided value.
       * @param value: any - The value for the returned Thenable.
       * @returns Thenable<any> - Returns a Thenable that is resolved with the provided value.
       */


      static resolve(value) {
        return new Thenable(resolve => {
          resolve(value);
        });
      }
      /*
       * Returns a Thenable that is rejected for the provided reason.
       * @param rejectionReason: any - The reason for the returned Thenable's rejection.
       * @returns Thenable<any> - Returns a Thenable that is rejected for the provided reason.
       */


      static reject(rejectionReason) {
        return new Thenable((resolve, reject) => {
          reject(rejectionReason);
        });
      }
      /*
       * Behaves like Promise.all() but uses Thenables synchronously if possible. If all Thenables in the chains are non-Promises,
       * then this returns a Thenable that resolves to an array of results. If a Promise is encountered, then a Promise is returned
       * that resolves to an array of results (same as Promise.all()).
       * @param thenables: Iterable<Thenable|Promise> - The iterable of Thenables or Promises for which to wait.
       * @returns Thenable<Array<any>>|Promise<Array<any>> - If all Thenables in the chains are non-Promises, then this returns a
       * Thenable that resolves to an array of results. If a Promise is encountered, then a Promise is returned that resolves to an
       * array of results (same as Promise.all()).
       */


      static all(thenables) {
        assert(thenables, `thenables was falsy -- should be defined as an iterable of Thenables: ${thenables}`);
        const thenableArray = [...thenables];
        const thenableResultsArray = [];

        while (thenableArray.length > 0) {
          if (typeUtils.isInstanceOf(thenableArray[0], Promise)) {
            break; // We need to degrade to Promise.all() for the remainder.
          }

          const thenable = thenableArray.shift();

          if (thenable.rejectionReason !== undefined) {
            return Thenable.reject(thenable.rejectionReason);
          }

          const thenableValue = thenable.value; // .then check is added to reduce the noise and limit the instanceOf check to thenables

          if (thenableValue && thenableValue.then !== undefined && (typeUtils.isInstanceOf(thenableValue, Thenable) || typeUtils.isInstanceOf(thenableValue, Promise))) {
            thenableArray.unshift(thenableValue);
          } else {
            thenableResultsArray.push(thenableValue);
          }
        }

        if (thenableArray.length > 0) {
          // We degraded to a Promise.all(). Merge whatever results we have so far.
          return Promise.all(thenableArray).then(promiseResultsArray => {
            thenableResultsArray.push.apply(thenableResultsArray, promiseResultsArray);
            return thenableResultsArray;
          });
        }

        return Thenable.resolve(thenableResultsArray);
      }
      /*
       * Returns a Thenable or a Promise based on the input value or rejectionReason. If the value is a Promise
       * then we have to let this convert to a Promise chain and return Promises from here on, otherwise it will
       * return a Thenable.
       * @param value: any - The value for the returned Thenable.
       * @param rejectionReason: any - The reason for the returned Thenable's rejection.
       * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on the input value or rejectionReason.
       */


      static _resolveOrReject(value, rejectionReason) {
        if (value && value.then !== undefined) {
          if (typeUtils.isInstanceOf(value, Promise)) {
            // We encountered a Promise, so we have to convert to an async Promise chain from here on.
            return value;
          }

          if (value.rejectionReason) {
            return Thenable.reject(value.rejectionReason);
          }

          return Thenable.resolve(value.value);
        }

        if (rejectionReason) {
          return Thenable.reject(rejectionReason);
        }

        return Thenable.resolve(value);
      }
      /*
       * Appends fulfillment and rejection handlers to the Thenable, and returns a new Thenable resolving to the return value of
       * the called handler, or to its original settled value if the Thenable was not handled (i.e. if the relevant handler onFulfilled
       * or onRejected is not a function).
       *
       * This method mirrors its equivalent in the Promise API, but calls everything synchronously if it can. If it encounters a Promise
       * in the chain, this synchronous Thenable chain will convert to an asynchronous Promise chain at that point.
       * @param onFulfilled: function - A Function called if the Thenable is fulfilled. This function has one argument, the fulfillment value.
       * @param onRejected: function - A Function called if the Thenable is rejected. This function has one argument, the rejection reason.
       * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on output of the onFulfilled or onRejected handler.
       */


      then(onFulfilled, onRejected) {
        let newValue;
        let newRejectionReason;

        try {
          if (this.value === this || this.rejectionReason === this) {
            throw new TypeError("Thenable cannot resolve to itself.");
          }

          if (this.rejectionReason) {
            if (typeof onRejected === "function") {
              if (typeUtils.isInstanceOf(this.rejectionReason, Promise)) {
                return this.rejectionReason.then(undefined, onRejected);
              }

              newValue = onRejected(this.rejectionReason);
            } else {
              newRejectionReason = this.rejectionReason;
            }
          } else if (typeof onFulfilled === "function") {
            if (typeUtils.isInstanceOf(this.value, Promise)) {
              return this.value.then(onFulfilled);
            }

            newValue = onFulfilled(this.value);
          }
        } catch (e) {
          newRejectionReason = e;
        }

        newValue = newValue || this.value;
        return Thenable._resolveOrReject(newValue, newRejectionReason);
      }
      /*
       * Appends a rejection handler callback to the Thenable, and returns a new Thenable resolving to the return value of the callback if it
       * is called, or to its original fulfillment value if the Thenable is instead fulfilled.
       *
       * This method mirrors its equivalent in the Promise API, but calls everything synchronously if it can. If it encounters a Promise
       * in the chain, this synchronous Thenable chain will convert to an asynchronous Promise chain at that point.
       * @param onRejected: function - A Function called if the Thenable is rejected. This function has one argument, the rejection reason.
       * @returns Thenable<any> | Promise<any> - Returns a Thenable or a Promise based on output of the onRejected handler.
       */


      catch(onRejected) {
        return this.then(undefined, onRejected);
      }

    }

    /* LDS has proxy compat enabled */

    function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=arguments[i]!=null?arguments[i]:{};var ownKeys=Object.keys(Object(source));if(typeof Object.getOwnPropertySymbols==='function'){ownKeys=ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym){return Object.getOwnPropertyDescriptor(source,sym).enumerable;}));}ownKeys.forEach(function(key){_defineProperty(target,key,source[key]);});}return target;}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}function _objectWithoutProperties(source,excluded){if(source==null)return {};var target=_objectWithoutPropertiesLoose(source,excluded);var key,i;if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++){key=sourceSymbolKeys[i];if(excluded.indexOf(key)>=0)continue;if(!Object.prototype.propertyIsEnumerable.call(source,key))continue;target[key]=source[key];}}return target;}function _objectWithoutPropertiesLoose(source,excluded){if(source==null)return {};var target={};var sourceKeys=Object.keys(source);var key,i;for(i=0;i<sourceKeys.length;i++){key=sourceKeys[i];if(excluded.indexOf(key)>=0)continue;target[key]=source[key];}return target;}// *******************************************************************************************************************
    /*
     * debug-extension is a private LDS library for internal use by the LDS team ONLY.
     * DO NOT USE!
     */let logsList=[];let debugEnabled=false;// Variable to store reference to the cache. The event listener uses this.
    let _ldsCacheDebug;/*
     * Function to help troubleshoot LDS cache.
     * Only available in debug mode (not in production since asserts are removed).
     * Listens to event requesting cacheData, and does a postMessage with both the cached records and observable data.
     * @param {object} event Event representing request for cache contents.
     */{window.addEventListener("message",event=>{// We only accept messages from ourselves.
    if(event.origin!==window.origin){return;}// Check same window.
    if(event.source!==window){return;}const sendMessage=function(message){window.postMessage(message,window.origin);};if(event.data.type){if(event.data.type==="GET_CACHE_DATA"){const cacheData=[];_ldsCacheDebug._cacheStore.privateMap.forEach((v,k)=>{cacheData.push({key:k,eTag:v.eTag,value:v.value});});const cacheObservablesData=[];_ldsCacheDebug._observablesMap.forEach((v,k)=>{// JSON parse/stringify to avoid serialization error during window.post later.
    cacheObservablesData.push(JSON.parse(JSON.stringify({key:v.root.name,isComplete:v.root.isComplete,lastError:v.root.lastError,lastValue:v.root.lastValue,subscriptionsSize:v.root.subscriptions?v.root.subscriptions.size:null,observablesMapKey:k})));});// Build lru queue order.
    const lruQueueOrder={};let index1=1;if(_ldsCacheDebug._cacheStore.lruQueue&&_ldsCacheDebug._cacheStore.lruQueue._back){let item1=_ldsCacheDebug._cacheStore.lruQueue._back;while(item1){lruQueueOrder[item1.key]=index1;index1++;item1=item1.previous;}}sendMessage({type:"CACHE_CONTENTS",cacheData,cacheObservablesData,lruQueueOrder,dependencies:_ldsCacheDebug._cacheStore.privateMap.get("lds.LdsCacheDependencies:LDS Production Cache")},event);}else if(event.data.type==="ENABLE_DEBUG_CACHE"){handleDebug("ENABLE_DEBUG");sendMessage({type:"DEBUG_MESSAGE",message:"Enabled Debug"});}else if(event.data.type&&event.data.type==="DISABLE_DEBUG_CACHE"){handleDebug("DISABLE_DEBUG");sendMessage({type:"DEBUG_MESSAGE",message:"Disabled Debug"});}else if(event.data.type&&event.data.type==="CLEAR_LOGS_CACHE"){handleDebug("CLEAR_LOGS");sendMessage({type:"DEBUG_MESSAGE",message:"Cleared Logs"});}else if(event.data.type&&event.data.type==="GET_LOGS_CACHE"){const logs=handleDebug("GET_LOGS");sendMessage({type:"DEBUG_MESSAGE",logs,message:"Responded with logs."});}else if(event.data.type&&event.data.type==="GET_VERSION_APP"){sendMessage({type:"APP_VERSION",message:"Version 2"});}}});}/*
     * Prepares logging info.
     * @param actionKey: Type of log.
     * @param parametersProvider: Function which provides data to be logged. Lazily evaluated only if required.
     * @param parameters
     * @returns boolean true
     */function handleDebug(actionKey,parametersProvider){if(actionKey==="ENABLE_DEBUG"){// Flag to indicate debugging is enabled.
    debugEnabled=true;}else if(actionKey==="DISABLE_DEBUG"){// Flag to indicate debugging is disabled.
    debugEnabled=false;}else if(actionKey==="GET_LOGS"){// Return logs accumulated so far in this session.
    return logsList;}else if(actionKey==="CLEAR_LOGS"){// Clear the logs.
    logsList=[];}else if(debugEnabled){// Based on the type of logs capture different attributes.
    const date=new Date();const response={timestamp:date,timestampMillis:date.getMilliseconds()};// Copy all parameters.
    Object.assign(response,parametersProvider());if(actionKey==="record-service_commitPuts1"){response.label="Begin Commit Puts";}else if(actionKey==="record-service_commitPuts2"){response.label="Done Commit Puts";}else if(actionKey==="record-service_stagePut"){response.label="Stage Put";}else if(actionKey==="complete-and-remove-observables"){response.label="Complete And Remove Observable";}else if(actionKey==="emit-value"){response.label="Emit Value";}else if(actionKey==="created-observable"){response.label="Created Observable";}else if(actionKey==="emit-suppressed"){response.label="Emit Filtered";}else if(actionKey==="stage-emit"){response.label="Stage Emit";}// Add to list of logs.
    logsList.push(JSON.stringify(response));}// Since this is called from within an assert, return true.
    return true;}/*
     * Sets the specific LdsCache instance to debug.
     * @param ldsCache: LdsCache - The particular LdsCache instance to debug.
     * @returns void
     */function setLdsCacheToDebug(ldsCache){_ldsCacheDebug=ldsCache;}/**
     * @param condition Assert condition
     * @param assertMessage Message to include with error if assertion fails
     * @throws Error with assertMessage if assertion condition is false.
     */function assert$1(condition,assertMessage){if(!condition){throw new Error("Assertion Failed!: "+assertMessage+" : "+condition);}}const safeValues=new WeakMap();/**
     * Takes an object and returns a read only version of it. The current logic uses proxies to accomplish this but this could change in the future.
     * @param targetObject An object that should be wrapped in a proxy to make it read only. Required, and must be JSON-serializable.
     * @returns A read only version of the provided object. Mutation attempts to this object will result in an error being thrown.
     */function toReadOnly(targetObject){{assert$1(JSON.stringify(targetObject)!==undefined,`Values being made read-only should be serializable to JSON: ${targetObject}`);}return lwc.readonly(targetObject);}/**
     * Takes a value from LDS and makes it safe for Aura code that could be running in 'compat' mode for IE 11. This method is bad in that it
     * exposes a leaky abstraction, and should eventually be replaced by better interop code in 216.
     * @param targetObject An object that has been wrapped in a Proxy to make it read only to consumers.
     * @returns An un-proxied but frozen object that can be safely used for read only tasks in Aura code.
     */function getValueForAura(targetObject){if(targetObject===undefined){return targetObject;}// Proxy.getKey should only be defined if we're in compat mode.
    const isCompatMode=Proxy.getKey!==undefined;if(!isCompatMode){// The proxy is safe to return as-is so long as we're not in compat mode or it's already frozen.
    return targetObject;}let safeValue=safeValues.get(targetObject);if(safeValue!==undefined){// We have already unwrapped and frozen something so we don't need to do that again.
    return safeValue;}safeValue=JSON.parse(JSON.stringify(targetObject));safeValues.set(targetObject,safeValue);return safeValue;}/**
     * The valueType to use when building ObjectInfoCacheKeyBuilder.
     */const OBJECT_INFO_VALUE_TYPE="uiapi.ObjectInfoRepresentation";/**
     * Time to live for the ObjectInfo cache value. 15 minutes.
     */const OBJECT_INFO_TTL=15*60*1000;/**
     * The valueType to use when building RecordCacheKeys.
     */const RECORD_VALUE_TYPE="uiapi.RecordRepresentation";/**
     * Currently the refresh time in recordLibrary is 30 seconds, so we will keep it the same.
     * This is also the fresh time for actions so having it more consistent would cause the least confusing to our users.
     */const RECORD_TTL=1000*30;/**
     * The master record type id.
     */const MASTER_RECORD_TYPE_ID="012000000000000AAA";/**
     * MAX_DEPTH is the SOQL limit, so we don't denorm past MAX_DEPTH levels.
     */const MAX_DEPTH=5;/**
     * The valueType to use when building RecordCreateDefaultsCacheKeyBuilder.
     */const RECORD_CREATE_DEFAULTS_VALUE_TYPE="uiapi.RecordDefaultsRepresentation";/**
     * Time to live for RecordCreateDefaults object. 15 minutes.
     */const RECORD_CREATE_DEFAULTS_TTL=15*60*1000;/**
     * The valueType to use when building RecordUiCacheKeyBuilder.
     */const RECORD_UI_VALUE_TYPE="uiapi.RecordUiRepresentation";/**
     * Time to live for RecordUi object. 15 minutes.
     */const RECORD_UI_TTL=15*60*1000;/**
     * The valueType to use when building LayoutCacheKeyBuilder.
     */const LAYOUT_VALUE_TYPE="uiapi.RecordLayoutRepresentation";/**
     * Time to live for a layout cache value. 15 minutes.
     */const LAYOUT_TTL=15*60*1000;/**
     * The valueType to use when building RecordAvatarCacheKeyBuilder.
     */const RECORD_AVATAR_VALUE_TYPE="uiapi.RecordAvatarRepresentation";/**
     * Time to live for the RecordAvatar cache value. 5 minutes.
     */const RECORD_AVATAR_TTL=5*60*1000;/**
     * Conceptually an entity capable of observing an observable.
     * It is a collection of handlers that for responding to streaming events from the observable stream.
     */class Observer{/**
         * constructor
         * @param next Method to call when observable emits a value
         * @param error Method to call when observable emits an error
         * @param complete Method to call when observable retires the observer
         */constructor(next,error$$1,complete){this.next=next;this.error=error$$1;this.complete=complete;}}/**
     * Utility functions used in the LDS layer.
     */ /**
     * Converts to 18-char record ids. Details at http://sfdc.co/bnBMvm.
     * @param recordId A 15- or 18-char record id.
     * @returns An 18-char record id, and throws error if an invalid record id was provided.
     */function to18(recordId){{assert$1(recordId.length===15||recordId.length===18,`Id ${recordId} must be 15 or 18 characters.`);}if(recordId.length===15){// Add the 3 character suffix
    const CASE_DECODE_STRING="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456";for(let offset=0;offset<15;offset+=5){let decode_value=0;for(let bit=0;bit<5;bit++){const c=recordId[offset+bit];if(c>="A"&&c<="Z"){decode_value+=1<<bit;}}recordId+=CASE_DECODE_STRING[decode_value];}}return recordId;}/**
     * Returns true if the given lastFetchTime is within the given ttl based on the given nowTime.
     * @param nowTime The now time.
     * @param lastFetchTime The time that the thing was last fetched.
     * @param ttl The time to live.
     * @returns See description.
     */function isWithinTtl(nowTime,lastFetchTime,ttl){if(nowTime-lastFetchTime<ttl){return true;}return false;}/**
     * Clones the object objectToClone and optionally freezes the clone. Chooses a clone approach based on cacheKey.
     * @param objectToClone The object to clone.
     * @param cacheKey The cache key.
     * @param doFreeze true to freeze the cloned object.
     * @returns A cloned and optionally frozen object.
     */function clone(objectToClone,cacheKey,doFreeze){let clonedObject;const freezeObj=doFreeze===undefined?false:doFreeze;if(cacheKey){switch(cacheKey.getValueType()){case OBJECT_INFO_VALUE_TYPE:case RECORD_AVATAR_VALUE_TYPE:// We expect this to be frozen in cache, so return as-is.
    clonedObject=objectToClone;break;case RECORD_VALUE_TYPE:case RECORD_CREATE_DEFAULTS_VALUE_TYPE:case RECORD_UI_VALUE_TYPE:case LAYOUT_VALUE_TYPE:default:clonedObject=cloneDeepCopy(objectToClone,freezeObj);}}else{// default to clone if no cacheKey.
    clonedObject=cloneDeepCopy(objectToClone,freezeObj);}return clonedObject;}/**
     * Throws the given err if it is a javascript core error.
     * @param err The error to check
     */function throwIfJavascriptCoreError(err){if(typeUtils.isInstanceOf(err,ReferenceError)||typeUtils.isInstanceOf(err,TypeError)||typeUtils.isInstanceOf(err,RangeError)||typeUtils.isInstanceOf(err,EvalError)||typeUtils.isInstanceOf(err,SyntaxError)||typeUtils.isInstanceOf(err,URIError)){throw err;}}/**
     * Determines if the specified value is the CacheWrapper. This gets automatically added around
     * values that are cached using the CacheAccessor.
     * @param value the object to check if wrapped.
     * @returns True if the value is the wrapper or false if undefined or not a wrapper.
     */function isCacheWrapper(value){return value&&value.hasOwnProperty("lastFetchTime")&&value.hasOwnProperty("value");}/**
     * Returns the object API name.
     * @param value The value from which to get the object API name.
     * @returns The object API name.
     */function getObjectApiName(value){if(typeof value==="string"){return value;}else if(value&&typeof value.objectApiName==="string"){return value.objectApiName;}throw new TypeError("Value is not a string, ObjectId, or FieldId.");}/**
     * Returns the field API name, qualified with an object name if possible.
     * @param value The value from which to get the qualified field API name.
     * @return The qualified field API name.
     */function getFieldApiName(value){if(typeof value==="string"){return value;}else if(value&&typeof value.objectApiName==="string"&&typeof value.fieldApiName==="string"){return value.objectApiName+"."+value.fieldApiName;}throw new TypeError("Value is not a string or FieldId.");}/**
     * Split the object API name and field API name from a qualified field name.
     * Eg: Opportunity.Title returns ['Opportunity', 'Title']
     * Eg: Opportunity.Account.Name returns ['Opportunity', 'Account.Name']
     * @param fieldApiName The qualified field name.
     * @return The object and field API names.
     */function splitQualifiedFieldApiName(fieldApiName){const idx=fieldApiName.indexOf(".");if(idx<1){// object api name must non-empty
    throw new TypeError("Value does not include an object API name.");}return [fieldApiName.substring(0,idx),fieldApiName.substring(idx+1)];}/**
     * Checks the type of the value and throws an error if it is incorrect.
     * @param value The value to check.
     * @param type The type of the Object. For instance, 5 has the type Number.
     * @throws If value is not of the expected type Or if value is null/undefined.
     */function checkType(value,type){if(value==null){throw new TypeError("Unexpected null or undefined value.");}if(type===Array&&!Array.isArray(value)||type===Object&&!typeUtils.isPlainObject(value)||type===Function&&!typeUtils.isFunction(value)||!type.prototype.isPrototypeOf(Object(value))&&type!==Array){throw new TypeError("Value does not have expected type: "+type.name+", got: "+value+".");}}/**
     * Results the default function for doing recursive equality call,
     * The default function just checks content of inner objects.
     * @param value1 First value to compare.
     * @param value2 Second value to compare.
     * @param depth Current depth of the recursion.
     * @returns True if the objects are equivalent, False otherwise.
     */function _defaultRecurseFunction(value1,value2,depth){{assert$1(depth>=1,"depth should never drop below 1");}const json1=JSON.stringify(value1);const json2=JSON.stringify(value2);// Previously we were using the recurse function to actually deeply compare objects up to a specified
    // depth of recursion. However this was very slow in IE 11. For now we are abandoning this as the default
    // check in favor of a JSON string comparison which performs better in IE 11 due to fewer function calls
    // and less recursion. See P4 history if retrieving the old way is necessary.
    //
    // IE 11 performance workaround until we have a better strategy (using eTags, cacheVersions, etc.);
    return json1===json2;}/**
     * Check if the two values provided are equal.
     * @param value1 The first value to be checked.
     * @param value2 The second value to be checked.
     * @param recurseFn Function that will be called on members of array or object to check equality. Defaults to _defaultRecurseFunction.
     * @param depth The max recursion depth of the object to check. Defaults to 10.
     * @return Boolean whether the objects are equal.
     */function equivalent(value1,value2,recurseFn,depth){recurseFn=recurseFn!==undefined?recurseFn:_defaultRecurseFunction;depth=depth!==undefined&&depth>0?depth:10;const value1IsValueWrapper=isCacheWrapper(value1);const value2IsValueWrapper=isCacheWrapper(value2);let targetValue1=value1;let targetValue2=value2;if(value1IsValueWrapper){targetValue1=value1.value;}if(value2IsValueWrapper){targetValue2=value2.value;}if(targetValue1===targetValue2){return true;}else if(value1IsValueWrapper&&value2IsValueWrapper){// Try checking eTags.
    const value1ETag=value1.eTag;const value2ETag=value2.eTag;if(value1ETag!==null&&value1ETag!==undefined&&value2ETag!==null&&value2ETag!==undefined){return value1ETag===value2ETag;}}if(typeof targetValue1==="object"&&recurseFn){// Plain object, do default comparison for object values.
    return recurseFn(targetValue1,targetValue2,depth);}return false;}/**
     * A queue backed by a doubly linked list and indexed with a map.
     * Useful for the LRU
     */class MappedQueue{constructor(){this._map=new Map();this._back=null;this._front=null;}/**
         * Standard enqueue operation.  Put the data in the back of the queue.
         * @param key The key of the value.  This will be used as the key in the map.
         * @param value The value to place in the queue.
         */enqueue(key,value){const _map=this._map;if(_map.has(key)){this.remove(key);}const entry={key,value,previous:this._back};if(this._back){this._back.next=entry;}else{this._front=entry;}this._back=entry;_map.set(key,entry);}/**
         * Dequeues and returns the key/value pair as a tuple
         * @return The key/value pair of the item in the front of the line or undefined if empty.
         */dequeue(){const entry=this._front;if(!entry){return undefined;}this.remove(entry.key);return [entry.key,entry.value];}/**
         * Removes the value from the queue and the map that corresponds with the key.
         * @param key The key of the value to remove.
         */remove(key){const _map=this._map;const entry=_map.get(key);if(entry){_map.delete(key);if(entry===this._back){this._back=entry.previous;}else if(entry.next){entry.next.previous=entry.previous;}if(entry===this._front){this._front=entry.next;}else if(entry.previous){entry.previous.next=entry.next;}}}/**
         * Gets the number of entries in the queue.
         * @return The number of entries.
         */getSize(){return this._map.size;}}/**
     * Given an observable, allows you to handle just the next immediate next(), error(), or complete()
     * issued from the observable then unsubscribes.
     */class HandleObserver{constructor(done,subscription,nextFn,errorFn,completeFn){this.done=done;this.subscription=subscription;this.nextFn=nextFn;this.errorFn=errorFn;this.completeFn=completeFn;}/**
         * Handler to call once next, error, or complete is called to unsubscribe from the observer.
         * @param sub Subscription for the observer.
         */finish(sub){if(!this.subscription&&sub){this.subscription=sub;}if(this.done&&this.subscription){this.subscription.unsubscribe();}}/**
         * Handler for the next immediate next() call on the observable.
         * @param value Value from the observable.
         */next(value){if(!this.done&&this.nextFn){this.nextFn(value);this.done=true;this.finish();}}/**
         * Handler for the next immediate error() call on the observable.
         * @param error
         */error(error$$1){if(!this.done&&this.errorFn){this.errorFn(error$$1);this.done=true;this.finish();}}/**
         * Handler for the next immediate complete() call on the observable.
         */complete(){if(!this.done&&this.completeFn){this.completeFn();this.done=true;this.finish();}}}/**
     * Given an observable, allows you to handle just the next immediate next(), error(), or complete()
     * issued from the observable then unsubscribes.
     * @param observable The observable to handle.
     * @param nextFn The function that will take the observable's next() call.
     * @param errorFn The function that will take the observable's error() call.
     * @param completeFn The function that will take the observable's complete() call.
     */function handleNextObservation(observable,nextFn,errorFn,completeFn){const observer=new HandleObserver(false,undefined,nextFn,errorFn,completeFn);const subscription=observable.subscribe(observer);observer.finish(subscription);}/**
     * Returns an array of values constructed from the given collection.
     * @param collection The collection to be converted into an array.
     * @returns See description.
     */function collectionToArray(collection){const arrayFromCollection=[];const collectionArray=Array.from(collection);for(let len=collectionArray.length,n=0;n<len;n++){arrayFromCollection.push(collectionArray[n]);}return arrayFromCollection;}/**
     * Creates a clone of the object by recursively traversing it. Clone is frozen based on the freeze flag.
     * @param objectToClone Object.
     * @param freezeClone True if returned cloned object should be frozen.
     * @returns Cloned object. See description.
     */function cloneDeepCopy(objectToClone,freezeClone){let response=objectToClone;if(objectToClone!==null){if(Array.isArray(objectToClone)){// We want to retain type as Array in the cloned object.
    response=[];for(let len=objectToClone.length,i=0;i<len;i++){response[i]=cloneDeepCopy(objectToClone[i],freezeClone);}if(freezeClone){Object.freeze(response);}}else if(typeof objectToClone==="object"){response={};const objectToCloneKeys=Object.keys(objectToClone);for(let len=objectToCloneKeys.length,n=0;n<len;n++){const objectToCloneKeysEntry=objectToCloneKeys[n];const objectToCloneEntry=objectToClone[objectToCloneKeysEntry];if(objectToCloneEntry!==undefined){response[objectToCloneKeysEntry]=cloneDeepCopy(objectToCloneEntry,freezeClone);}}if(freezeClone){Object.freeze(response);}}}return response;}/**
     * Subscribes to the given observable and returns a promise that resolves when the observable emits or completes, and rejects when the observable errors.
     * @param observable The observable to convert into a promise.
     * @param unsubscribeWhenValueReceived True if the promise should unsubscribe from the observable when a value is received in any
     * of the observer callbacks, or false to not unsubscribe.
     * @param resolveNextCount The numbers of emits on the observable required in order to resolve.
     * @returns See description.
     */function observableToPromise(observable,unsubscribeWhenValueReceived,resolveNextCount){resolveNextCount=resolveNextCount!==undefined?resolveNextCount:1;{assert$1(resolveNextCount>0,"resolveNextCount must be greater than 0");}unsubscribeWhenValueReceived=unsubscribeWhenValueReceived!==undefined?unsubscribeWhenValueReceived:false;return new Promise((resolve,reject)=>{let isDone=false;let subscription;let nextCounter=0;const observer=new Observer(value=>{nextCounter+=1;if(resolveNextCount&&nextCounter>=resolveNextCount){// subscription is null when the next handler is called synchronously from the observable.subscribe invocation.
    if(unsubscribeWhenValueReceived&&subscription){subscription.unsubscribe();}isDone=true;resolve(value);}},err=>{// subscription is null when the error handler is called synchronously from the observable.subscribe invocation.
    if(unsubscribeWhenValueReceived&&subscription){subscription.unsubscribe();}isDone=true;reject(err);},()=>{// subscription is null when the complete handler is called synchronously from the observable.subscribe invocation.
    if(unsubscribeWhenValueReceived&&subscription){subscription.unsubscribe();}isDone=true;resolve();});subscription=observable.subscribe(observer);// The following is true when the observable.subscribe invocation above synchronously invokes one of the handlers on the observer.
    // In that case the handler would not have been able to unsubscribe because subscription wouldn't have been defined yet, which
    // means we need to unsubscribe here.
    if(unsubscribeWhenValueReceived&&isDone&&subscription){subscription.unsubscribe();}});}/**
     * This Subscription is based on the ES Observable reference implementation under consideration
     * for ES spec inclusion:
     * https://github.com/tc39/proposal-observable/blob/master/src/Observable.js
     * It is not the same code because the reference impl currently doesn't have good ways to
     * emit change notifications and also and doesn't have a good implementation for multiplexing,
     * but it has the exact same interface.
     */class Subscription{/**
         * Constructor.
         * @param observer An observer object that should have the next, error, and complete handlers.
         * @param unsubscriber Function called when the subscription is unsubscribed.
         */constructor(observer,unsubscriber){this._isClosed=false;this.observer=observer;this.unsubscriber=unsubscriber;}/**
         * From the Subscription interface.
         * @returns True if the subscription is closed, else false.
         */get closed(){return this._isClosed;}/**
         * Internal method - do not call.
         * @param value The next value.
         */next(value){this.observer.next(value);}/**
         * Internal method - do not call.
         * @param error An error has occurred - this is the message.
         */error(error$$1){if(this.observer.error){this.observer.error(error$$1);}}/**
         * From the Subscription interface.
         */unsubscribe(){if(!this._isClosed){this.unsubscriber.removeSubscriber();this._isClosed=true;}}}/**
     * This is used to remove the subscriptions from the exiting observable
     */class Unsubscriber{constructor(){/**
             * Set of subscriptions from which the subscription is removed from
             */this.subscriptions=new Set();}/**
         * remove the subscriptions
         */removeSubscriber(){this.subscriptions.delete(this.subscription);}}/**
     * Set to track the values which are being refreshed in 304 use case
     */const lastValueTracker=new Set();/**
     * Holds perf information with regards to a specific perf transaction.
     */class PerfMarker{/**
         * Constructor.
         * @param key Perf key used to index into aura metrics.
         * @param perfContext Holds context information about the perf transaction.
         */constructor(perfKey,perfContext){this.perfKey=perfKey;this.perfContext=perfContext;}}/**
     * Holds context information with regards to a specific PerfMarker.
     */class PerfContext{constructor(cacheKeyValueType,keyStatus){this.cacheKeyValueType=cacheKeyValueType;}}/**
     * LDS Cache namespace for perf markers
     */const LDS_CACHE_PERF_NAMESPACE="lds_cache";class Instrumentation{constructor(instrumentationService){this._instrumentationService=instrumentationService;}/**
         * Logs a aura metrics performance markStart event.
         * @param eventName - Name of the event.
         * @param cacheKeyValueTypeString - LDS cache key value type string.
         * @returns A new PerfMarker object to be used with markEndLDS().
         */markStartLDS(eventName,cacheKeyValueTypeString){const perfKey=this._getUniquePerfKey(eventName);const perfContext=new PerfContext(cacheKeyValueTypeString);const perfMarker=new PerfMarker(perfKey,perfContext);this._instrumentationService.markStart(LDS_CACHE_PERF_NAMESPACE,perfKey,perfContext);return perfMarker;}/**
         * Logs a aura metrics performance markEnd event.
         * @param perfMarker - PerfMarker produced by markStartLDS().
         */markEndLDS(perfMarker){this._instrumentationService.markEnd(LDS_CACHE_PERF_NAMESPACE,perfMarker.perfKey,perfMarker.perfContext);}/**
         * Logs an error event.
         * @param error The error to log.
         * @param errorSource Source of the error.
         * @param errorType Type of the error.
         * @param additionalInfo Additional info for the attributes.
         */logError(error$$1,errorSource,errorType,additionalInfo){// Type is any because we are setting fields dynamically on the attribute object at runtime.
    const attributes={additionalInfo:additionalInfo||""};if(error$$1.body){attributes.body=JSON.stringify(error$$1.body);}if(error$$1.stack){attributes.stack=error$$1.stack;}if(error$$1.message){attributes.message=error$$1.message;}try{attributes.error=JSON.stringify(error$$1);}catch(exception){// tslint:disable-next-line:no-empty
    }this._instrumentationService.error(attributes,errorSource,errorType);}/**
         * Makes a unique key by appending current time stamp.
         * @param sharedKey - A non-unique key for conversion to unique key.
         * @returns A unique key.
         */_getUniquePerfKey(sharedKey){// Aura metrics stores transaction and markers using name as a key. This key is an index to all transactions and marks. Requests to LDS
    // for an operation tracked via performance marker can be interleaved leading to override of existing marker of same name.
    // So, LDS needs to use a unique marker name to keep track of key names.
    // Makes a unique perfkey by using MetricsService time which provides high precision time.
    return sharedKey+"."+this._instrumentationService.time();}/**
         * Registers track caches stats for given name.
         * @param name Name of the Cache
         * @returns CacheStats object to track hits and misses.
         */registerCacheStats(name){return this._instrumentationService.registerCacheStats(name);}}var InstrumentationErrorType;(function(InstrumentationErrorType){InstrumentationErrorType["INFO"]="info";InstrumentationErrorType["WARN"]="warn";InstrumentationErrorType["ERROR"]="error";})(InstrumentationErrorType||(InstrumentationErrorType={}));/**
     * This Observable is based on the ES Observable reference implementation under consideration
     * for ES spec inclusion:
     * https://github.com/tc39/proposal-observable/blob/master/src/Observable.js
     * It is not the same code because the reference impl currently doesn't have good ways to
     * emit change notifications and also and doesn't have a good implementation for multiplexing,
     * but it has the exact same interface.
     */class Observable{/**
         * Constructor.
         * @param name Name of the observable.
         */constructor(name){/**
             * Set of tracked subscriptions
             */this.subscriptions=new Set();/**
             * Tells if the observable is complete or not
             */this.isComplete=false;this.name=name;{handleDebug("created-observable",()=>{return {observableName:name};});}}/**
         * Wraps a call to next() in a try/catch with error logging/gacking to ensure subsequent subscriptions will also have
         * their next() methods called.
         * @param subscription The Observer's subscription.
         * @param newValue new value for an Observable of which Observers need to be notified.
         */_nextWithErrorHandling(subscription,newValue){try{subscription.next(newValue);}catch(e){// A subscription handler threw an error. Make sure the framework logs and gacks, but then allow other
    // subscriptions to continue receiving emits.
    logger.logError(e);}}/**
         * Wraps a call to error() in a try/catch with error logging/gacking to ensure subsequent subscriptions will also have
         * their error() methods called.
         * @param subscription An Observer's subscription.
         * @param error Error thrown during execution.
         */_errorWithErrorHandling(subscription,error$$1){try{subscription.error(error$$1);}catch(e){// A subscription handler threw an error. Make sure the framework logs and gacks, but then allow other
    // subscriptions to continue receiving emits.
    logger.logError(e);}}/**
         * Wraps a call to complete() in a try/catch with error logging/gacking to ensure subsequent Observers will also have
         * their complete() methods called.
         * @param observer A subscribed Observer.
         */_completeWithErrorHandling(observer){try{if(observer.complete){observer.complete();}}catch(e){// An Observer's complete() threw an error. Make sure the framework logs and gacks, but then allow other
    // completions to continue.
    logger.logError(e);}}/**
         * From the Observable interface. Subscribers can pass up to 3 functions: 1) a next() function,
         * 2) an error() function, and 3) a complete() function.
         * @param observer Observer to which you are subscribing OR the next handler.
         * @param error The error handler.
         * @param complete The complete handler.
         * @returns The subscription.
         */subscribe(observer,error$$1,complete){let observerObj;if(typeof observer==="object"){observerObj=observer;}else{observerObj=new Observer(observer,error$$1,complete);}if(this.isComplete){if(observerObj.complete){// Hotness for completion.
    this._completeWithErrorHandling(observerObj);}return undefined;}// don't re-subscribe if observer is already subscribed
    let currentSubscription;this.subscriptions.forEach(subscriptionObj=>{const subscriptionObserver=subscriptionObj.observer;if(subscriptionObserver===observerObj||subscriptionObserver.next===observer){currentSubscription=subscriptionObj;}});if(currentSubscription){return currentSubscription;}const unsubscriber=new Unsubscriber();const subscription=new Subscription(observerObj,unsubscriber);unsubscriber.subscriptions=this.subscriptions;unsubscriber.subscription=subscription;this.subscriptions.add(subscription);// Be a BehaviorSubject (emit lastValue upon subscribe.)
    if(this.lastValue!==undefined){this._nextWithErrorHandling(subscription,this.lastValue);}else if(this.lastError!==undefined){this._errorWithErrorHandling(subscription,this.lastError);}return subscription;}/**
         * Internal method - do not call.
         * Emits a value on the observable.
         * @param newValue a new value to emit to all this Observable's Observers.
         */emitValue(newValue){// Runtime error checking.
    if(this.isComplete){throw new Error(`Cannot emit a value to a completed observable. Observable name: ${this.name}, newValue: ${newValue}`);}if(this.lastError){throw new Error(`Cannot emit a value to a observable in error state. Observable name: ${this.name}, newValue: ${newValue}`);}if(newValue===undefined){throw new Error(`newValue cannot be undefined. Observable name: ${this.name}, newValue: ${newValue}`);}// TODO: root observable will not call emitValue if value to written in cache is same as existing one,
    // move this filtering to child observable with changes for records. W-4045855
    this.lastValue=newValue;this.lastError=undefined;{handleDebug("emit-value",()=>{return {observableName:this.name,emitValue:newValue};});}if(this.subscriptions.size>0){this.subscriptions.forEach(subscription=>{this._nextWithErrorHandling(subscription,newValue);});}}/**
         * Internal method - do not call.
         * Emits an error on the observable.
         * @param error The value to emit to all this Observable's Observers.
         * @param instrumentationService LDS Cache's instance of Instrumentation service.
         */emitError(error$$1,instrumentationService){// Runtime error checking.
    // TODO - only do this if going to throw an error
    const errorStr=typeUtils.isString(error$$1)?error$$1:JSON.stringify(error$$1);if(this.isComplete){throw new Error(`Cannot emit an error on a completed observable. Observable name: ${this.name}, error: ${errorStr}`);}if(this.lastError&&instrumentationService){instrumentationService.logError(error$$1,"LDS_OBSERVABLE_IN_ERROR_STATE",InstrumentationErrorType.ERROR,`Observable Name: ${this.name}`);}this.lastValue=undefined;this.lastError=error$$1;this.subscriptions.forEach(subscription=>{if(this._errorWithErrorHandling){this._errorWithErrorHandling(subscription,error$$1);}else{logger.logError(`_errorWithErrorHandling undefined during Observable emitError! Observable name: ${this.name}, err= ${JSON.stringify(error$$1)} +  -- err.message=${error$$1.message}`);}});}/**
         * From the Observable interface.
         * Completes the observable. Nothing else can ever be emitted.
         */complete(){try{this.subscriptions.forEach(subscription=>{const subscriptionObserver=subscription.observer;if(subscriptionObserver.complete){this._completeWithErrorHandling(subscriptionObserver);}if(!subscription.closed){// If the observer didn't unsubscribe during complete(), do it for them to prevent a memory leak.
    subscription.unsubscribe();}});}finally{this.subscriptions.clear();this.lastValue=undefined;this.lastError=undefined;this.isComplete=true;}}/**
         * Stream operator. Transforms items from the caller stream using the specified mapFn.
         * @param mapFn Function which takes a value and returns a new value.
         * @returns A new observable which emits transformed values.
         */map(mapFn){const name=this._constructChainName("Map");const transformedObservable=new Observable(name);this._wireTransformedObservableWithOperation(transformedObservable,value=>{const mappedValue=mapFn(value);transformedObservable.emitValue(mappedValue);});return transformedObservable;}/**
         * Stream operator. Filters items emitted by the source Observable by only emitting an item when it is distinct from the previous item.
         * @param compareFn Function which should return true the previous and new are determined to be different.
         * @returns A new observable which only emits an item when it is distinct from the previous item.
         */distinctUntilChanged(compareFn){const name=this._constructChainName("DistinctUntilChanged");const transformedObservable=new Observable(name);this._wireTransformedObservableWithOperation(transformedObservable,value=>{// TODO: W-5698880 This is not a generic operator anymore because it is using the global lastValueTracker. This needs to be refactored
    // into a custom operator or this operator's name needs to be changed.
    if(compareFn(transformedObservable.lastValue,value)&&!lastValueTracker.has(transformedObservable.lastValue)&&transformedObservable.lastValue!==undefined){this._debugLogEmitSuppressed(value);}else{// The value is different than the last value, so emit or its 304 with new observer
    transformedObservable.emitValue(value);lastValueTracker.delete(transformedObservable.lastValue);}});return transformedObservable;}/**
         * Stream operator. Filter items emitted by the source Observable by only emitting those that satisfy a specified predicate.
         * @param predicateFn Function which should return true if the value passes the filter, else false.
         * @returns A new observable which only emits items that satisfy a specified predicate.
         */filter(predicateFn){const name=this._constructChainName("Filter");const transformedObservable=new Observable(name);this._wireTransformedObservableWithOperation(transformedObservable,value=>{if(predicateFn(value)){// The value passed the filter so we need to emit!
    transformedObservable.emitValue(value);}else{this._debugLogEmitSuppressed(value);}});return transformedObservable;}/**
         * Stream operator. Skips a given number of emits and then always emits.
         * @param count How many emits to skip before passing through all emits.
         * @returns A new observable which emits all values after the given number of emits has taken place.
         */skip(count){const name=this._constructChainName("Skip");const transformedObservable=new Observable(name);let emitsSoFar=0;this._wireTransformedObservableWithOperation(transformedObservable,value=>{emitsSoFar+=1;if(emitsSoFar>count){transformedObservable.emitValue(value);}else{this._debugLogEmitSuppressed(value);}});return transformedObservable;}/**
         * Stream operator. Discard items emitted by an Observable until a specified condition becomes false.
         * @param predicateFn Predicate function which governs the skipping process. skipWhile calls this
         *      function for each item emitted by the source Observable until the function returns false,
         *      whereupon skipWhile begins mirroring the source Observable (starting with that item).
         * @returns A new observable which exhibits the behavior described above.
         */skipWhile(predicateFn){const name=this._constructChainName("SkipWhile");const transformedObservable=new Observable(name);let isSkipping=true;this._wireTransformedObservableWithOperation(transformedObservable,value=>{if(isSkipping){isSkipping=predicateFn(value);}if(!isSkipping){transformedObservable.emitValue(value);}else{this._debugLogEmitSuppressed(value);}});return transformedObservable;}/**
         * Stream operator. Transforms items from the caller stream using the specified mapFn. Differs from
         *      map in that the newly created observable is actually a FilterOnSubscribeBehaviorSubject.
         * @param filterOnSubscribeFn Filter function which gets passed to behavior subject instance.
         * @param mapFn Function which takes a value and returns a new value.
         * @returns A new FilterOnSubscribeBehaviorSubject which emits transformed values.
         */mapWithFilterOnSubscribeBehaviorSubject(filterOnSubscribeFn,mapFn){const name=this._constructChainName("MapWithFilterOnSubscribeBehaviorSubject");const transformedObservable=new FilterOnSubscribeBehaviorSubject(name,filterOnSubscribeFn);this._wireTransformedObservableWithOperation(transformedObservable,value=>{transformedObservable.lastValuePreTransformed=value;const mappedValue=mapFn(value);transformedObservable.emitValue(mappedValue);});return transformedObservable;}/**
         * Wires up the given transformedObservable with the given operationFn. Standardizes the error handling
         * and complete handling.
         * @param transformedObservable The new observable which represents another link in the observable chain by performing the given operationFn.
         * @param operationFn The operation to perform for this link in the observable chain.
         */_wireTransformedObservableWithOperation(transformedObservable,operationFn){const observerTransform=new Observer(value=>{if(transformedObservable.lastError===undefined&&!transformedObservable.isComplete){try{transformedObservable.lastValuePreTransformed=value;operationFn(value);}catch(error$$1){throwIfJavascriptCoreError(error$$1);transformedObservable.emitError(error$$1);}}},error$$1=>{if(transformedObservable.lastError===undefined&&!transformedObservable.isComplete){transformedObservable.emitError(error$$1);}},()=>{if(transformedObservable.lastError===undefined&&!transformedObservable.isComplete){transformedObservable.complete();}});this._decorateTransformedObservableWithSubscriptionOptimizationLogic(transformedObservable,observerTransform);}/**
         * Decorate the subscribe method on the transformed observable to take care of the following:
         * 1. If the transformed observable is not connected to the source observable, then connect it.
         * 2. Return a Subscription<T> instance with a decorated unsubscribe method. This method will disconnect
         *      from the source observable if there are no subscriptions left on the transformed observable.
         * @param transformedObservable The instance of the transformed observable to decorate. It will be modified in place.
         * @param observerTransform  The observer to use in the subscription to the source observable. It contains the transform logic.
         */_decorateTransformedObservableWithSubscriptionOptimizationLogic(transformedObservable,observerTransform){transformedObservable.sourceObservable=this;const originalSubscribeFn=transformedObservable.subscribe;transformedObservable.subscribe=(observer,error$$1,complete)=>{// If not connected to the source yet, then connect.
    if(!transformedObservable.sourceSubscription){transformedObservable.sourceSubscription=transformedObservable.sourceObservable.subscribe(observerTransform,error$$1,complete);}// Call the original subscribe method to get the subscription.
    const originalSubscription=originalSubscribeFn.call(transformedObservable,observer,error$$1,complete);// Decorate the Subscription<T> instance with a new unsubscribe method.
    const originalUnsubscribeFn=originalSubscription.unsubscribe;originalSubscription.unsubscribe=()=>{originalUnsubscribeFn.call(originalSubscription);// Disconnect from the source if there are no other subscriptions on the transformed observable.
    if(transformedObservable.subscriptions.size<=0){transformedObservable.sourceSubscription.unsubscribe();transformedObservable.sourceSubscription=undefined;}};return originalSubscription;};}/**
         * Constructs the name of the observable by adding the given linkName onto the rest of the chain's name.
         * @param linkName The name of the link in the observable chain.
         * @returns The full chain name for the observable.
         */_constructChainName(linkName){return linkName.trim()+" <= "+this.name;}/**
         * Log an entry that an emit was filtered out.
         * @param value Object that was filtered out.
         */_debugLogEmitSuppressed(value){{handleDebug("emit-suppressed",()=>{return {observableName:this.name,emitValue:value};});}}}/**
     * Created a Behavior subject Observable to handle stale emits
     */class FilterOnSubscribeBehaviorSubject extends Observable{constructor(name,filterOnSubscribeFunction){super(name);this._filterOnSubscribeFunction=filterOnSubscribeFunction;}/**
         * From the Observable interface. Subscribers can pass up to 3 functions: 1) a next() function,
         * 2) an error() function, and 3) a complete() function.
         * @param observer Observer to which you are subscribing OR the next handler.
         * @param error The error handler.
         * @param complete The complete handler.
         * @returns The subscription.
         */subscribe(observer,error$$1,complete){// Do all the same subscribe stuff as in Observable up until the emit logic.
    let observerObj;if(typeof observer==="object"){observerObj=observer;}else{observerObj=new Observer(observer,error$$1,complete);}if(this.isComplete){if(observerObj.complete){// Hotness for completion.
    this._completeWithErrorHandling(observerObj);}return undefined;}// don't re-subscribe if observer is already subscribed
    let currentSubscription;this.subscriptions.forEach(subscriptionObj=>{const subscriptionObserver=subscriptionObj.observer;if(subscriptionObserver===observerObj||subscriptionObserver.next===observer){currentSubscription=subscriptionObj;}});if(currentSubscription){return currentSubscription;}const unsubscriber=new Unsubscriber();const subscription=new Subscription(observerObj,unsubscriber);unsubscriber.subscriptions=this.subscriptions;unsubscriber.subscription=subscription;this.subscriptions.add(subscription);// Be a BehaviorSubject (emit lastValue upon subscribe.)
    if(this.lastValue!==undefined&&this._filterOnSubscribeFunction(this.lastValuePreTransformed||this.lastValue)){this._nextWithErrorHandling(subscription,this.lastValue);}else if(this.lastError!==undefined){this._errorWithErrorHandling(subscription,this.lastError);}return subscription;}}/**
     * Data class containing properties for the core observable chain.
     *
     * root -> changesOnly -> unwrapped -> readOnly
     */class CoreObservables{}/**
     * Used as a central factory for creating Thenables or Promises depending on a configuration setting.
     */class ThenableFactory{/**
         * A factory method used for creating synchronous Thenables or asynchronous Promises depending on an
         * internal configuration setting. Returns a resolved Thenable or Promise.
         * @param value The value to which this Thenable should resolve
         * @returns Either a synchronous Thenable or an asynchronous Promise depending on an internal
         *         configuration setting.
         */static resolve(value){return Thenable.resolve(value);}/**
         * A factory method used for creating synchronous Thenables or asynchronous Promises depending on an
         * internal configuration setting. Returns a rejected Thenable or Promise.
         * @param rejectionReason The reason for this Thenable's rejection.
         * @returns Either a synchronous Thenable or an asynchronous Promise depending on an internal
         *         configuration setting.
         */static reject(rejectionReason){return Thenable.reject(rejectionReason);}}/**
     * Immutable value wrapper
     */class ValueWrapper{/**
         * Constructor.
         * @param value The value to wrap.
         * @param eTag The etag for the value.
         * @param lastFetchTime The last fetch time of the value.
         * @param extraInfoObject Extra info for future expansion.
         */constructor(value,lastFetchTime,eTag,extraInfoObject){Object.defineProperties(this,{value:{value,enumerable:true},lastFetchTime:{value:lastFetchTime,enumerable:true},eTag:{value:eTag,enumerable:true},extraInfoObject:{value:extraInfoObject,enumerable:true}});}/**
         * Used when a ValueWrapper has come out of the cache as a plain object because it has been deserialized from JSON by the
         * cache or because it is a read only proxy and not an actual ValueWrapper instance. This will convert compatible object
         * structure back into a ValueWrapper instance.
         * @param target An object with a structure that is compatable with ValueWrapper structure.
         * @returns The object converted back into a ValueWrapper instance.
         */static fromObject(target){return new ValueWrapper(target.value,target.lastFetchTime,target.eTag,target.extraInfoObject);}/**
         * Shallow clones the given valueWrapper but uses valueOverride for its value.
         * @param valueWrapper The ValueWrapper instance to copy.
         * @param valueOverride The value to assign to the copied ValueWrapper. Must not be undefined.
         * @returns The shallow cloned ValueWrapper with its value as valueOverride.
         */static cloneWithValueOverride(valueWrapper,valueOverride){if(valueWrapper.extraInfoObject){return new ValueWrapper(valueOverride,valueWrapper.lastFetchTime,valueWrapper.eTag,cloneDeepCopy(valueWrapper.extraInfoObject));}return new ValueWrapper(valueOverride,valueWrapper.lastFetchTime,valueWrapper.eTag,valueWrapper.extraInfoObject);}}/**
     * A standard delimiter that CacheKeyBuilders can use when producing String keys.
     */const KEY_DELIM=":";/**
     * The valueType to use when building LdsCacheDependenciesCacheKeyBuilder
     */const LDS_CACHE_DEPENDENCIES_VALUE_TYPE="lds.LdsCacheDependencies";/**
     * Represents a cache key.
     */class CacheKey{/**
         * Constructs a CacheKey. This shouldn't be called directly except by CacheKeyBuilders.
         * @param valueType A string representing the type of the value being cached. The string key will comprise
         *        part of the string representation of the CacheKey object. Note that this depends on CacheKeyBuilders using
         *        string when creating valueType so that those are registered in the
         *        global namespace. Because they need to be global, it's a good idea to start the string with an "lds." namespace
         *        prefix.
         * @param localKey A string representing a unique key for value to cache. Different segments of this key should be
         *        delimited with KEY_DELIM, and the segments themselves should not contain KEY_DELIM.
         */constructor(valueType,localKey){if(Object.getPrototypeOf(this).constructor!==CacheKey){throw new TypeError("CacheKey is final and cannot be extended.");}{assert$1(valueType!==undefined,"ValueType must not undefined");if(valueType){assert$1(valueType.indexOf(KEY_DELIM)===-1,`valueType keys may not contain the key delimiter '${KEY_DELIM}' -- ${valueType}`);}}Object.defineProperties(this,{valueType:{value:valueType,writable:false},localKey:{value:localKey,writable:false}});}/**
         * Returns the local key.
         */getLocalKey(){return this.localKey;}/**
         * Returns the value type.
         */getValueType(){return this.valueType;}/**
         * Returns the complete string representation of the cache key.
         * @returns See description.
         */getKey(){const keyForValueType=this.valueType;{assert$1(keyForValueType&&keyForValueType.length>0,`No key found for valueType ${this.valueType}`);assert$1(this.localKey&&this.localKey.length>0,`No localKey existed for ${this.valueType}`);}return `${keyForValueType}${KEY_DELIM}${this.localKey}`;}/**
         * Takes a string representation of a cache key and converts it back into a CacheKey object. Note that this depends on CacheKeyBuilders
         * using string when creating valueType so that those are registered in the
         * global namespace. Because they need to be global, it's a good idea to start the string with an "lds." namespace prefix.
         * @param keyString The string representation of a cache key.
         * @returns The CacheKey object representation of the cache key string.
         */static parse(keyString){const firstDelimIndex=keyString.indexOf(KEY_DELIM);const localKey=keyString.substr(firstDelimIndex+1);const keyForValueType=keyString.substr(0,firstDelimIndex);{assert$1(keyForValueType&&keyForValueType.length>0,`No key found for valueType ${keyString}`);assert$1(localKey&&localKey.length>0,`No localKey existed for ${keyString}`);}return new CacheKey(keyForValueType,localKey);}}/**
     * Abstract class for building cache keys. All cache key builders must extend this class.
     */class CacheKeyBuilder{/**
         * Constructor.
         * @param valueType - The value type of the CacheKey that this builder should build.
         */constructor(valueType){if(Object.getPrototypeOf(this).constructor===CacheKeyBuilder){throw new TypeError("CacheKeyBuilder cannot be instantiated directly, a subclass must be used.");}{assert$1(valueType!==undefined,"valueType can not be undefined");}Object.defineProperties(this,{valueType:{value:valueType,writable:false}});}/**
         * Returns the value type of the cache key that the builder will build.
         */getValueType(){return this.valueType;}}/**
     * Constructs a cache key for the LDS_CACHE_DEPENDENCIES_VALUE_TYPE. Keys are constructed from:
     * - ldsCacheName
     *
     * This cache key is for storing cache value dependencies. This is internally used ONLY within the LDS cache code.
     */class LdsCacheDependenciesCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(LDS_CACHE_DEPENDENCIES_VALUE_TYPE);}/**
         * Sets the ldsCacheName for the cache key.
         * @param ldsCacheName The name of the LDS cache used to scope related dependencies?
         * @returns The current object. Useful for chaining method calls.
         */setLdsCacheName(ldsCacheName){this._ldsCacheName=ldsCacheName;return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the LDS_CACHE_DEPENDENCIES_VALUE_TYPE value type.
         */build(){{assert$1(this._ldsCacheName,`A ldsCacheName must be provided to build a LdsCacheDependenciesCacheKey: ${this._ldsCacheName}`);}return new CacheKey(this.getValueType(),`${this._ldsCacheName}`);}}/**
     * Property bag for value wrapper optional properties.
     */class ValueWrapperOptionalProperties{/**
         * Constructor.
         * @param eTag The eTag.
         * @param extraInfoObject Additional value to store on the value wrapper. Could be anything.
         */constructor(eTag,extraInfoObject){this.eTag=eTag;this.extraInfoObject=extraInfoObject;}}/**
     * Represents the dependency map in a way that is JSON serializable. This is the format the map is stored inside the cache store.
     */class SerializableDependencyMapCacheValue{/**
         * Constructor.
         */constructor(){Object.defineProperties(this,{dependencies:{value:{},enumerable:true},inverseDependencies:{value:{},enumerable:true}});}}/**
     * Used to directly access underlying the cache store(s) using during a single cache transaction.
     */class CacheAccessor{/**
         * Constructs a new CacheAccessor.
         * @param ldsCache The LdsCache parent (scope) for this CacheAccessor.
         * @param timeSource The TimeSource for this CacheAccessor.
         */constructor(ldsCache,timeSource){Object.defineProperties(this,{_ldsCache:{value:ldsCache},_nowTime:{value:timeSource.now()},_stagedPutsMap:{value:new Map()},_stagedDependenciesKeyStringsMap:{value:new Map()},_dependencyKeyStringsToClear:{value:new UsefulSet()},_stagedEmitsMap:{value:new Map()},_stagedEmitsKeyStringsSet:{value:new UsefulSet()},_phase:{value:CacheAccessorPhase.CACHE_ACCESSOR_PHASE_STAGING_PUTS,writable:true}});{// Used for debugging. Only available in debug mode.
    setLdsCacheToDebug(ldsCache);}}/**
         * Returns the number representing the time snapshot that will be used by this CacheAccessor's transaction. All cache
         * operations in this transaction will share the same timestamp.
         */get nowTime(){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}return this._nowTime;}/**
         * Gets the cached value wrapper using the provided cache key. This will return staged values ahead of values actually in the underlying
         * cache so that cache operations see a consistent view of values that have been manipulated during the operation.
         * @param cacheKey The cache key for the value you want to fetch.
         * @returns Returns a thenable which resolves to a value wrapper if there is a cache hit, otherwise returns undefined.
         */get(cacheKey){const{_phase,_stagedPutsMap,_ldsCache}=this;{assert$1(_phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}const keyString=cacheKey.getKey();const stagedPutItem=_stagedPutsMap.get(keyString);if(stagedPutItem!==undefined){// Staged values should take precedence over values in the cache.
    const stagedValueToCache=stagedPutItem.valueToCache;return ThenableFactory.resolve(stagedValueToCache);}// TODO: we should consider a perf enhancement here of also getting anything that we know in our dependency tracking is referenced
    // by this cache key, in anticipation of it also being needed by denorm etc. We could use getAll() here and still just make one
    // trip through the cache stores, but get everything related to this cached in memory.
    return _ldsCache.getValue(cacheKey);}/**
         * If a value was committed to cache, this will synchronously return it. This must be called after commitPuts() has been called. This is useful
         * for comparing old and new values when handling affected keys to see exactly how they should be handled.
         * @param cacheKey The cache key for the committed cache value you want to fetch - required.
         * @returns Returns the value wrapper if available and part of the cache commit operation, otherwise returns undefined.
         */getCommitted(cacheKey){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}const keyString=cacheKey.getKey();const stagedPutItem=this._stagedPutsMap.get(keyString);if(stagedPutItem){return stagedPutItem.valueToCache;}return undefined;}/**
         * Stages a put to cache and also stages an Observable emit. If the valueToCache is not a ValueWrapper, it will be wrapped on behalf of
         * the caller. One or more dependentCacheKeys should be provided if possible to track dependencies, or [] if putting a root value.
         * @param dependentCacheKeysArray An array of zero or more cache keys that depend on the key/value being staged. These are used
         *        by the cache to track dependencies for consumers and let them know what they have affected in the return value of commitPuts().
         * @param cacheKey The cache key for the value you want to put.
         * @param valueToCache The cache value to put. If it is not a ValueWrapper, it will automatically be wrapped.
         * @param valueToEmit The cache value to emit via Observable. Must not be an instance of ValueWrapper since it will automatically be wrapped in an equivalent ValueWrapper as valueToCache.
         * @param valueWrapperOptionalProperties Optional object with properties to set on the ValueWrapper. If valueToCache is a ValueWrapper these will be ignored.
         */stagePut(dependentCacheKeysArray,cacheKey,valueToCache,valueToEmit,valueWrapperOptionalProperties){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_STAGING_PUTS,"Puts can only be staged before commitPuts()");assert$1(JSON.stringify(valueToCache)!==undefined,"Only values that can be JSON.stringify can be cached.");}// Default values.
    valueWrapperOptionalProperties=valueWrapperOptionalProperties?valueWrapperOptionalProperties:new ValueWrapperOptionalProperties();const keyString=cacheKey.getKey();let valueWrapperToCache;if(typeUtils.isInstanceOf(valueToCache,ValueWrapper)&&valueToCache.value!==undefined){valueWrapperToCache=valueToCache;}else{valueWrapperToCache=this.newValueWrapper(valueToCache,valueWrapperOptionalProperties.eTag,valueWrapperOptionalProperties.extraInfoObject);}const valueWrapperToEmit=ValueWrapper.cloneWithValueOverride(valueWrapperToCache,valueToEmit);{handleDebug("record-service_stagePut",()=>{return {dependentCacheKeysArray:dependentCacheKeysArray.map(key=>key.getKey()),cacheKey:keyString,valueToCache:valueWrapperToCache,valueToEmit:valueWrapperToEmit};});}const stagedPutItem=new StagedPutItem(cacheKey,valueWrapperToCache,valueWrapperToEmit,true);this._stagedPutsMap.set(keyString,stagedPutItem);if(dependentCacheKeysArray.length>0){this.stageDependencies(dependentCacheKeysArray,cacheKey);}}/**
         * Stages a put which updates the lastFetchTime of the valueWrapper of the given cacheKey. This will stage an emit
         * for the cache value but will not trigger affected keys for it. We don't want affected keys triggered because
         * lastFetchTime is cache internal metadata that affected key handlers would not care about. Affected key handlers should only
         * get triggered if the actual value has changed.
         * @param cacheKey The cache key for the value you want to put.
         */stagePutUpdateLastFetchTime(cacheKey){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_STAGING_PUTS,"Update last fetch time can only be staged before commitPuts()");}const keyString=cacheKey.getKey();this.get(cacheKey).then(existingValueWrapper=>{const valueWrapperToCache=this.newValueWrapper(existingValueWrapper.value,existingValueWrapper.eTag,existingValueWrapper.extraInfoObject);{handleDebug("stageUpdateLastFetchTime",()=>{return {cacheKey:keyString};});}const stagedPutItem=new StagedPutItem(cacheKey,valueWrapperToCache,valueWrapperToCache,false);this._stagedPutsMap.set(keyString,stagedPutItem);});}/**
         * Used in cases where a dependencies should be tracked, but puts cannot be staged using stagePut() because the values that would be put are
         * known to be insufficient for other affected objects that will need to be denormed/emitted in response. In these cases we need to know about
         * the dependency so that a full refresh of that insufficient value can trigger everything to get caught up. Example: merging record values
         * where we don't have enough fields but we can tell the value has changed, therefore we must refresh the entire record with all tracked
         * fields. One or more dependentCacheKeys should be provided.
         * @param dependentCacheKeysArray An array of zero or more cache keys that depend on the key/value being staged. These are used
         *        by the cache to track dependencies for consumers and let them know what they have affected in the return value of commitPuts().
         * @param cacheKey The cache key for the value on which the dependent cache keys depend.
         */stageDependencies(dependentCacheKeysArray,cacheKey){{assert$1(dependentCacheKeysArray.length>0,`dependentCacheKeysArray should not be empty for ${cacheKey.getKey()}`);}const keyString=cacheKey.getKey();const{_stagedDependenciesKeyStringsMap}=this;let dependentKeyStringsSet=_stagedDependenciesKeyStringsMap.get(keyString);if(dependentKeyStringsSet===undefined){dependentKeyStringsSet=new UsefulSet();_stagedDependenciesKeyStringsMap.set(keyString,dependentKeyStringsSet);}for(let len=dependentCacheKeysArray.length,c=0;c<len;c++){const dependentCacheKey=dependentCacheKeysArray[c];const dependentCacheKeyString=dependentCacheKey.getKey();dependentKeyStringsSet.add(dependentCacheKeyString);}}/**
         * Clears the direct dependencies of this cache key. Should only be called when a comprehensive replacement is taking place (i.e. not a
         * merged value that may be missing as complete a view as what existed prior). If not, valid dependencies could be lost.
         * @param cacheKey The cache key for the dependencies you want to clear.
         */stageClearDependencies(cacheKey){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_STAGING_PUTS,"Dependencies can only be cleared while staging puts, before commitPuts() and before finished().");}const keyString=cacheKey.getKey();this._dependencyKeyStringsToClear.add(keyString);}/**
         * Commits all staged puts to underlying cache stores. This should be called after making all necessary stagePut() calls because afterwards
         * stagePut() will fail.
         * @return Thenable which resolves to a set of cache keys affected by committed puts. If the set contains values
         *      the appropriate response is to perform denorm (if applicable) of any affected values and either A) stage further emits for the
         *      affected keys/values if possible with what's in cache (the cache hit case) or B) refresh them using the appropriate API call
         *      (the cache miss case).
         */commitPuts(){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_STAGING_PUTS,"Puts can only be committed once, and must be committed before calling stageEmit().");}this._phase=CacheAccessorPhase.CACHE_ACCESSOR_PHASE_PUTS_COMMITTED;// Need a Map<CacheKey, Object> to call putAll();
    const cacheKeyToValueMap=new Map();const{_stagedPutsMap}=this;{handleDebug("record-service_commitPuts1",()=>{return {_stagedPutsMap};});}const stagedPutItems=Array.from(_stagedPutsMap.values());const{_stagedDependenciesKeyStringsMap,_ldsCache}=this;for(let len=stagedPutItems.length,n=0;n<len;n++){const stagedPutItem=stagedPutItems[n];const{cacheKey,valueToEmit,valueToCache}=stagedPutItem;cacheKeyToValueMap.set(cacheKey,toReadOnly(valueToCache));this._stageEmitInternal(cacheKey,valueToEmit);this.getOrCreateObservables(cacheKey,_ldsCache.getService(cacheKey.valueType).getCacheValueTtl());// Make sure there will be an observable for every value we're putting in the cache.
    }const thenable=_ldsCache.putAll(cacheKeyToValueMap).then(()=>{return this._saveDependencies(_stagedDependenciesKeyStringsMap,this._dependencyKeyStringsToClear);}).then(savedDepsMap=>{// Keep the LdsCache's in-memory dependency map up-to-date with the latest dependency info.
    _ldsCache.setDependenciesMap(new Map(savedDepsMap));// Filter down deps to return to what (A) is marked to trigger affected keys and (B) to what wasn't in the puts/emits and (C) what keys have Observables (if there
    // is no root Observable for the key there is nothing to do in response to it).
    const stagedPutKeys=Array.from(_stagedPutsMap.keys()).filter(key=>{const stagedPutItem=_stagedPutsMap.get(key);return stagedPutItem&&stagedPutItem.triggerAffectedKeys===true?true:false;});const keyStringsToOmit=new UsefulSet(_stagedDependenciesKeyStringsMap.keys()).union(stagedPutKeys);const affectedCacheKeysArray=_ldsCache.getAffectedKeys(stagedPutKeys,savedDepsMap,keyStringsToOmit);{handleDebug("record-service_commitPuts2",()=>{return {affectedCacheKeysArray};});}return new UsefulSet(affectedCacheKeysArray);});return thenable;}/**
         * Stages an Observable emit, typically in response to the keys affected by commitPuts() or a prior stageEmit(). This should be called only
         * after making all necessary stagePut() calls because afterwards stagePut() is disallowed (it will fail).
         * @param cacheKey The cache key for the value you want to emit.
         * @param valueToEmit The cache key for the value you want to emit.
         */stageEmit(cacheKey,valueToEmit){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_PUTS_COMMITTED,"Emits can only be staged after commitPuts().");}const keyString=cacheKey.getKey();{handleDebug("stage-emit",()=>{return {cacheKey:keyString,valueToEmit};});assert$1(!Array.from(this._stagedPutsMap.keys()).includes(keyString),`You should not stage an emit for something that was already committed to cache: ${keyString}`);}this._stageEmitInternal(cacheKey,valueToEmit);}/**
         * Can be used to see if there is already an emit staged for the provided cache key.
         * @param cacheKey The cache key for the value you want to emit.
         * @returns True if there is an emit staged for this cache key, else false.
         */isEmitStaged(cacheKey){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}const keyString=cacheKey.getKey();return this._stagedEmitsKeyStringsSet.has(keyString);}/**
         * Will return the number of staged emits from staging puts and emits.
         * @return The number of staged emits from staging puts and emits.
         */get stagedEmitsCount(){return this._stagedEmitsKeyStringsSet.size;}/**
         * WARNING!!!! ONLY FOR USE BY INTERNAL CACHE CORE. SERVICE METHODS SHOULD NOT CALL THIS METHOD EVER!!!
         * Runs all emits and disposes. The cache accessor cannot be used anymore after this has been called.
         *
         * TODO: We don't want this method exposed to users of CacheAccessor. We need a better way of exposing only what we want to people who use the cache accessor.
         * We should consider decoupling the transaction from the state machine driving the transaction.
         */finishCacheAccessor(){{assert$1(this._phase===CacheAccessorPhase.CACHE_ACCESSOR_PHASE_PUTS_COMMITTED,"finish() should only be called once, after puts have been committed.");}this._phase=CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED;const _ldsCache=this._ldsCache;const stagedEmitsMapArray=Array.from(this._stagedEmitsMap.entries());for(let len=stagedEmitsMapArray.length,n=0;n<len;n++){const[cacheKey,valueToEmit]=stagedEmitsMapArray[n];// TODO: make the sure valueToEmit is immutable here.
    const cacheValueTtl=_ldsCache.getService(cacheKey.valueType).getCacheValueTtl();const observables=_ldsCache.getOrCreateObservables(cacheKey,cacheValueTtl);// Make sure there will be an observable for every value we're putting in the cache.
    try{observables.root.emitValue(valueToEmit);}catch(err){const errorStr="Unexpected error during Observable emit! err="+JSON.stringify(err)+` -- err.message=${err.message}`;{// tslint:disable-next-line:no-console
    console.log(errorStr);// Better console handling when we're not in PROD.
    assert$1(false,errorStr);}logger.logError(errorStr);}}this._stagedDependenciesKeyStringsMap.clear();this._dependencyKeyStringsToClear.clear();this._stagedEmitsMap.clear();this._stagedEmitsKeyStringsSet.clear();}/**
         * Gets the observables for the CacheKey if they exist.
         * @param cacheKey The cache key for the Observable.
         * @returns The Observables for the cache key or undefined if there aren't any.
         */getObservables(cacheKey){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}return this._ldsCache.getObservables(cacheKey);}/**
         * Gets the observables for the CacheKey, creating them if necessary.
         * @param cacheKey The cache key for the Observable.
         * @param cacheValueTtl TTL for the value to be cached
         * @returns The Observables for the cache key.
         */getOrCreateObservables(cacheKey,cacheValueTtl){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}return this._ldsCache.getOrCreateObservables(cacheKey,cacheValueTtl);}/**
         * Checks if there is an observable for the given cache key.
         * @param cacheKey The key for the Observable.
         * @return True if the observable for the record exists, otherwise false.
         */hasObservable(cacheKey){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}return this._ldsCache.hasObservable(cacheKey);}/**
         * Makes a new immutable ValueWrapper with a lastFetchTime consistent with the rest of the CacheAccessor transaction. Optionally an
         * eTag may be provided (if available), as can an arbitrary Object containing information the ValueProvider may desire during a
         * future cache transaction.
         * @param valueToCache The value to be cached - required (must not be undefined). This should not be an already wrapped
         *      value (instanceof ValueWrapper).
         * @param eTag The eTag to be set on the ValueWrapper.
         * @param extraInfoObject An arbitrary object that ValueProviders may use to store additional information about the value being
         *      cached.
         * @returns The provided params wrapped in an immutable ValueWrapper.
         */newValueWrapper(valueToCache,eTag,extraInfoObject){{assert$1(this._phase!==CacheAccessorPhase.CACHE_ACCESSOR_PHASE_FINISHED,"Cache accessors should not be accessed after they have been finished.");}// We should never be storing a ValueWrapper with undefined value in the cache, log to splunk if this happens.
    if(valueToCache===undefined){this._ldsCache.instrumentation.logError(new Error("Undefined value for new value wrapper"),"LDS_UNDEFINED_NEW_VALUE_WRAPPER",InstrumentationErrorType.WARN,JSON.stringify({extraInfoObject,phase:this._phase}));}const valueWrapper=new ValueWrapper(valueToCache,this._nowTime,eTag,extraInfoObject);return valueWrapper;}/**
         * Caches cache key dependencies in LdsCache.
         * @param dependenciesKeyStringMap The keys in the map are string representations of cache
         *      keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>) in
         *      the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes.
         * @param dependencyKeyStringsToClear The string representations of cache keys that should be cleared out
         *      and replaced by new values in dependencyKeyStringsToClear, if any. Used to reset and recalculated what depends
         *      on a given key.
         * @return The merged data structure containing all cached dependencies merged with
         *      the newly provided dependencies in dependenciesKeyStringMap. The keys in the map are string representations of
         *      cache keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>)
         *      in the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes.
         */_saveDependencies(dependenciesKeyStringMap,dependencyKeyStringsToClear){// Make sure we're fully in sync with the cache's dependencies before saving.
    return this._retrieveAndMergeExistingDependencies(dependenciesKeyStringMap).then(mergedDependenciesMap=>{// We need to convert this merged dependencies map into a JSON-string-able form, so Sets need to become Arrays.
    const dependencyMapCacheValue=new SerializableDependencyMapCacheValue();const adjustedDependenciesMap=new Map(mergedDependenciesMap);// Copy the merged map so we don't modify it while we iterate over it.
    const clearDeps=dependencyKeyStringsToClear.size>0;const mergedDependenciesMapArray=Array.from(mergedDependenciesMap.entries());for(let len=mergedDependenciesMapArray.length,n=0;n<len;n++){const[key,value]=mergedDependenciesMapArray[n];let dependentKeyStringSet=value;if(clearDeps){dependentKeyStringSet=value.difference(dependencyKeyStringsToClear);const freshDependentKeys=dependenciesKeyStringMap.get(key);if(freshDependentKeys){// Add back in any deps that were added as part of the current cache operation.
    dependentKeyStringSet.addAll(freshDependentKeys);}}if(dependentKeyStringSet.size>0){adjustedDependenciesMap.set(key,dependentKeyStringSet);dependencyMapCacheValue.dependencies[key]=collectionToArray(dependentKeyStringSet);// Store the inverse map
    for(let dependencyLen=dependencyMapCacheValue.dependencies[key].length,j=0;j<dependencyLen;j++){const inverseDep=dependencyMapCacheValue.dependencies[key][j];if(!dependencyMapCacheValue.inverseDependencies[inverseDep]){dependencyMapCacheValue.inverseDependencies[inverseDep]=[key];}else{dependencyMapCacheValue.inverseDependencies[inverseDep].push(key);}}}else{adjustedDependenciesMap.delete(key);}}const{_ldsCache}=this;const cacheDepsCacheKey=new LdsCacheDependenciesCacheKeyBuilder().setLdsCacheName(_ldsCache.cacheName).build();return _ldsCache.put(cacheDepsCacheKey,dependencyMapCacheValue).then(()=>{return adjustedDependenciesMap;});});}/**
         * Same as stageEmit() but it doesn't validate lifecycle constraints so it can be called internally from places like stagePut().
         * @param cacheKey The cache key for the value you want to emit.
         * @param valueToEmit The cache key for the value you want to emit.
         */_stageEmitInternal(cacheKey,valueToEmit){const keyString=cacheKey.getKey();this._stagedEmitsKeyStringsSet.add(keyString);this._stagedEmitsMap.set(cacheKey,valueToEmit);}/**
         * Retrieves cached dependencies and merges them with the provided dependency information in dependenciesKeyStringMap.
         * @param dependenciesKeyStringMap The keys in the map are string representations of cache
         *      keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>) in
         *      the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes. This map should contain the dependencies for the given cache operation, not everything we've ever
         *      tracked.
         * @return The merged data structure containing all cached dependencies merged with
         *      the newly provided dependencies in dependenciesKeyStringMap. The keys in the map are string representations of
         *      cache keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>)
         *      in the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes.
         */_retrieveAndMergeExistingDependencies(dependenciesKeyStringMap){const{_ldsCache}=this;const ldsCacheName=_ldsCache.cacheName;const cacheDepsCacheKey=new LdsCacheDependenciesCacheKeyBuilder().setLdsCacheName(ldsCacheName).build();const thenable=_ldsCache.getValue(cacheDepsCacheKey).then(dependencyMapCacheValue=>{if(!dependencyMapCacheValue||!dependencyMapCacheValue.dependencies){// Nothing to merge; return the input unchanged.
    return dependenciesKeyStringMap;}const mergedDependenciesMap=new Map(dependenciesKeyStringMap);const depsObjectArray=Object.entries(dependencyMapCacheValue.dependencies);for(let len=depsObjectArray.length,n=0;n<len;n++){const[keyString,arrayOfKeyStrings]=depsObjectArray[n];// In the cached depsObject, key should be a string and value should be an array of strings.
    let set=mergedDependenciesMap.get(keyString);if(!set){set=new UsefulSet();mergedDependenciesMap.set(keyString,set);}set.addAll(arrayOfKeyStrings);}return mergedDependenciesMap;});return thenable;}}/**
     * Defines the state machine states that the cache accessor can be in.
     */var CacheAccessorPhase;(function(CacheAccessorPhase){CacheAccessorPhase["CACHE_ACCESSOR_PHASE_STAGING_PUTS"]="CACHE_ACCESSOR_PHASE_STAGING_PUTS";CacheAccessorPhase["CACHE_ACCESSOR_PHASE_FINISHED"]="CACHE_ACCESSOR_PHASE_FINISHED";CacheAccessorPhase["CACHE_ACCESSOR_PHASE_PUTS_COMMITTED"]="CACHE_ACCESSOR_PHASE_PUTS_COMMITTED";})(CacheAccessorPhase||(CacheAccessorPhase={}));/**
     * Represents an item that has been staged putted.
     */class StagedPutItem{/**
         * Constructor.
         * @param cacheKey See property description.
         * @param valueToCache See property description.
         * @param valueToEmit See property description.
         * @param triggerAffectedKeys See property description.
         */constructor(cacheKey,valueToCache,valueToEmit,triggerAffectedKeys){this.cacheKey=cacheKey;this.valueToCache=valueToCache;this.valueToEmit=valueToEmit;this.triggerAffectedKeys=triggerAffectedKeys;}}/*
     * Values that can be returned from a ValueProvider.provide method invocation.
     */var ValueProviderResult;(function(ValueProviderResult){ValueProviderResult["CACHE_HIT"]="CACHE_HIT";ValueProviderResult["CACHE_MISS"]="CACHE_MISS";ValueProviderResult["CACHE_MISS_REFRESH_UNCHANGED"]="CACHE_MISS_REFRESH_UNCHANGED";})(ValueProviderResult||(ValueProviderResult={}));/**
     * Helper for building a TransportResponse object. Defaults to a 200 OK with a null body.
     */class TransportResponseBuilder{constructor(){/**
             * Represents the body of the response. If the response is JSON it will already be parsed into an object.
             */this._body=null;/**
             * HTTP status code of the server response.
             */this._status=200;/**
             * HTTP status text of the server response.
             */this._statusText="OK";}/**
         * Sets the value to be used as the body of the TransportResponse.
         * @param body The value to use as the body of the TransportResponse.
         * @returns The current instance.
         */setBody(body){this._body=body;return this;}/**
         * Sets the value to be used as the status of the TransportResponse.
         * @param status The value to use as the status of the TransportResponse.
         * @returns The current instance.
         */setStatus(status){this._status=status;return this;}/**
         * Sets the value to be used as the statusText of the TransportResponse.
         * @param statusText The value to use as the statusText of the TransportResponse.
         * @returns The current instance.
         */setStatusText(statusText){this._statusText=statusText;return this;}/**
         * Builds the TransportResponse object.
         * @returns A new TransportResponse object built using the values set in the builder.
         */build(){return {ok:this._status>=200&&this._status<=299,status:this._status,statusText:this._statusText,body:this._body};}}/**
     * Mapping between wire name and ui-api resource reference config.
     */const wireAdapterNameToResourceReferenceMapping={"force/lds":{getForm:{categoryType:"UI_API",valueType:"uiapi.FormRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/forms/{apiName}",uriMappings:{apiName:"apiName"}},prefetch:true,batchable:false},getFormSectionUi:{categoryType:"UI_API",valueType:"uiapi.FormSectionUiRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/aggregate-ui",queryMappings:{formFactor:"formFactor",query:"query"}},prefetch:true,batchable:false},getLayout:{categoryType:"UI_API",valueType:"uiapi.RecordLayoutRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/layout/{objectApiName}",uriMappings:{objectApiName:"objectApiName"},queryMappings:{formFactor:"formFactor",layoutType:"layoutType",mode:"mode",recordTypeId:"recordTypeId"}},prefetch:true,batchable:false},getLayoutUserState:{categoryType:"UI_API",valueType:"uiapi.RecordLayoutUserStateRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/layout/{objectApiName}/user-state",uriMappings:{objectApiName:"objectApiName"},queryMappings:{formFactor:"formFactor",layoutType:"layoutType",mode:"mode",recordTypeId:"recordTypeId"}},prefetch:true,batchable:false},getObjectInfo:{categoryType:"UI_API",valueType:"uiapi.ObjectInfoRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/object-info/{objectApiName}",uriMappings:{objectApiName:"objectApiName"}},prefetch:true,batchable:false},getPicklistValues:{categoryType:"UI_API",valueType:"uiapi.PicklistValuesRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/object-info/{objectApiName}/picklist-values/{recordTypeId}/{fieldApiName}",uriMappings:{fieldApiName:"fieldApiName",objectApiName:"objectApiName",recordTypeId:"recordTypeId"}},prefetch:true,batchable:false},getPicklistValuesByRecordType:{categoryType:"UI_API",valueType:"uiapi.PicklistValuesCollectionRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/object-info/{objectApiName}/picklist-values/{recordTypeId}",uriMappings:{recordTypeId:"recordTypeId",objectApiName:"objectApiName"}},prefetch:true,batchable:false},getRecord:{categoryType:"UI_API",valueType:"uiapi.RecordRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/records/{recordId}",uriMappings:{recordId:"recordId"},queryMappings:{childRelationships:"childRelationships",fields:"fields",mode:"mode",layoutTypes:"layoutTypes",pageSize:"pageSize",optionalFields:"optionalFields"}},prefetch:true,batchable:false},getRecordAvatars:{categoryType:"UI_API",valueType:"uiapi.RecordAvatarBulk",urlTemplate:{uri:"/services/data/v45.0/ui-api/record-avatars/batch/{recordIds}",uriMappings:{recordIds:"recordIds"},queryMappings:{formFactor:"formFactor"}},prefetch:false,batchable:false},getRecordCreateDefaults:{categoryType:"UI_API",valueType:"uiapi.RecordDefaultsRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/record-defaults/create/{objectApiName}",uriMappings:{objectApiName:"objectApiName"},queryMappings:{formFactor:"formFactor",optionalFields:"optionalFields",recordTypeId:"recordTypeId"}},prefetch:true,batchable:false},getRecordUi:{categoryType:"UI_API",valueType:"uiapi.RecordUiRepresentation",urlTemplate:{uri:"/services/data/v45.0/ui-api/record-ui/{recordIds}",uriMappings:{recordIds:"recordIds"},queryMappings:{childRelationships:"childRelationships",formFactor:"formFactor",layoutTypes:"layoutTypes",modes:"modes",optionalFields:"optionalFields",pageSize:"pageSize"}},prefetch:true,batchable:false}}};/**
     * Returns object containing mapping for wire adapter name to resource reference configs.
     * @returns Object containing resource reference objects, indexed by wire name.
     */function getResourceReferenceMappings(){return wireAdapterNameToResourceReferenceMapping["force/lds"];}/**
     * Creates an emittable error object for when an internal LDS error occurs (eg a programmer error).
     * @param errorCode Error code to assist with post-mortem analysis. Generally unique per call site.
     * @param message Error message to assist with post-mortem analysis.
     * @param enableLogging Enable logging a gack to the server.
     * @returns An emittable error object.
     */function getLdsInternalError(errorCode,message,enableLogging){// Capture the stack for internal telemetry
    let stack;try{throw new Error(message);}catch(err){stack=err.stack;}const response={ok:false,status:500,statusText:"Internal Server Error",body:{errorCode,message,stack}};// Send the error to the server to create a gack
    if(enableLogging){logger.logError(JSON.stringify(response));}return toReadOnly(response);}/**
     * Creates an emittable error object matching UIAPI's response when a record is not found (eg has been deleted).
     * @returns An emittable error object.
     */function get404TransportResponse(){return toReadOnly({ok:false,status:404,statusText:"NOT_FOUND",body:[{errorCode:"NOT_FOUND",message:"The requested resource does not exist"}]});}/**
     * Creates a OK status TransportResponse with the provided body.
     * @param body The value to set as the body of the TransportResponse.
     * @returns A 200 OK TransportResponse object with the provided body.
     */function getOkTransportResponse(body){return {ok:true,status:200,statusText:"OK",body};}/**
     * Creates and returns a TransportResponse given an executeGlobalController promise. Standardizes error responses
     * from Aura actions.
     * TODO: Update CiJ response shape to match REST errors: W-5142315. Once this is completed we can update
     * the logic below to directly consume it instead of generating it.
     * @param auraGlobalControllerPromise - The return value from executeGlobalController.
     * @param isAggregateUi - whether to use aggregate UI API or not
     * @returns Returns a Promise resolved with a TransportResponse object.
     */async function createTransportResponseFromExecuteGlobalControllerCall(auraGlobalControllerPromise,isAggregateUi){const transportResponseBuilder=new TransportResponseBuilder();try{const result=await auraGlobalControllerPromise;if(isAggregateUi){if(result.compositeResponse&&result.compositeResponse[0]){const compositeResponse=result.compositeResponse[0];const body=compositeResponse.body;const httpStatusCode=compositeResponse.httpStatusCode;transportResponseBuilder.setBody(body).setStatus(httpStatusCode);if(httpStatusCode===200){transportResponseBuilder.setStatusText("OK");}else if(httpStatusCode===304){transportResponseBuilder.setStatusText("Not Modified");}else if(httpStatusCode>=400&&httpStatusCode<=599){const errorResponse=body[0];transportResponseBuilder.setStatusText(errorResponse.errorCode);}}else{throw new Error("Using AggregateUi but received invalid data back from ui-api aggregate-ui endpoint: "+JSON.stringify(result));}}else{transportResponseBuilder.setBody(result).setStatus(200).setStatusText("OK");}}catch(exception){let status=400;let statusText="Bad Request";let body=exception;// Massage the error shape if this error has the ui api error (the data property) wrapped in a bigger error.
    if(exception&&exception.data){// This is an aura controller error shape which has a more specific status.
    // We need to manually assign this value as the status of the TransportResponse
    // and generate the corresponding http status text.
    status=exception.data.statusCode;switch(status){case 304:statusText="Not Modified";break;case 404:statusText="Not Found";break;default:statusText="Bad Request";}body=exception.data;}transportResponseBuilder.setStatus(status).setStatusText(statusText).setBody(body);}const transportResponse=transportResponseBuilder.build();return transportResponse;}/**
     * Throws if the given transportResponse has a status code between 400 and 599 inclusive; otherwise
     * returns the given transportResponse.
     * @param transportResponse - The transportResponse to evaluate.
     * @throws TransportResponse - See description.
     */function throwIfClientOrServerError(transportResponse){if(transportResponse.status>=400&&transportResponse.status<=599){throw toReadOnly(transportResponse);}else{return transportResponse;}}/**
     * Executes the aura global controller for the given requestUrl and params. Transforms the response into a TransformResponse and rejects if there is a client/server error.
     * TODO: Instead of hard coding requests to aura global controller, let's abstract the transport mechanism.
     * Details in this user story: W-5153607.
     * @param requestUrl The request url.
     * @param requestParams Object containing the request parameters.
     * @param options Object containing hotSpot and background flags to control the actions, default is { hotspot:true, background: true }
     * @returns Returns a Promise resolved with a TransportResponse object.
     */function executeAuraGlobalController(requestUrl,requestParams,options){let hotspot=true;let background=true;if(options){if(options.hotspot!==undefined||options.hotspot!==null){// false is ok
    hotspot=options.hotspot;}if(options.background!==undefined||options.background!==null){// false is ok
    background=options.background;}}return createTransportResponseFromExecuteGlobalControllerCall(aura.executeGlobalController(requestUrl,requestParams,{hotspot,background})).then(throwIfClientOrServerError);}/**
     * Class to build a URL Query string.
     */class URLBuilder{constructor(){/**
             * Map containing all of the parameters.
             */this._queryMap=new Map();}/**
         * Setter method for the query string.
         * @param key Key of the parameter.
         * @param value Value of the parameter.
         */set(key,value){this._queryMap.set(key,value);}/**
         * Build method to return the query string.
         * @returns The query string.
         */build(){let queryString="";for(const[key,value]of this._queryMap.entries()){if(queryString.length===0){queryString+="?";}else{queryString+="&";}queryString+=key+"="+value;}return queryString;}}/**
     * Class to make calls to aggregate-ui. Maintains mapping of requests.
     */class TransportUtils{constructor(){/**
             * Temporary boolean switch to control usage of aggregate-ui in value providers. TODO @ethan.chan: Remove once switch-over is complete.
             * https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B0000005awLtIAI/view
             */this.useAggregateUi=false;/**
             * Map between referenceId and valueType for each aggregate-ui request.
             */this.requestMapping=new Map();/**
             * Counter for requests.
             */this._count=0;}/**
         * Increments the count by 1.
         */incrementCount(){this._count+=1;}/**
         * Gets the current count value.
         */get getCount(){return this._count;}/**
         * Executes the aura global controller via aggregate ui for the given wire name and params. Transforms the response into a TransformResponse
         * and rejects if there is a client/server error.
         * @param wireName The name of the wire adapter.
         * @param requestParams Object containing parameters of the ui-api request.
         * @param TTL The TTL of the resource. This is not currently being used in 218. Will be used for mobile.
         * @returns Returns a Promise resolved with a TransportResponse object.
         */executeAuraGlobalControllerAggregateUi(wireName,requestParams,TTL){this.incrementCount();const resourceReferenceConfig=getResourceReferenceMappings()[wireName];if(!resourceReferenceConfig){throw new Error("Could not find wire mapping for wire adapter: "+wireName+" in wire-name-to-reference-resource-map.ts");}const clientOptions=requestParams.clientOptions;const referenceId="LDS"+"_"+Date.now().toString()+"_"+this.getCount;const input=this._generateAggregateUiInput(resourceReferenceConfig,requestParams,clientOptions,referenceId,TTL);const aggregateUiInput={input};// Set mapping between reference id and value type. This is not being used currently. Will be used when batch request feature is enabled.
    this.requestMapping.set(referenceId,resourceReferenceConfig.valueType);const hotspot=true;const background=true;return createTransportResponseFromExecuteGlobalControllerCall(aura.executeGlobalController("RecordUiController.executeAggregateUi",aggregateUiInput,{hotspot,background}),true).then(throwIfClientOrServerError);}/**
         * Given a ResourceReferenceConfiguration and a parameters object, fetches the config from wire-mapping.ts file and generates the ui-api aggregate ui input. Example shape:
         * {
         *  "input":
         *      {
         *          "compositeRequest":[
         *              {
         *                  "url":"/services/data/v45.0/ui-api/object-info/Opportunity",
         *                  "referenceId":"lds_ObjectInfo"
         *              }
         *          ]
         *      }
         * }
         *
         * @param resourceReferenceConfig The ResourceReferenceConfiguration for the wire adapter.
         * @param params Object containing parameters of the ui-api request.
         * @param referenceId Unique identifier for the request.
         * @param TTL The TTL of the resource.
         * @returns A composite request representing the valueProvider parameters.
         */_generateAggregateUiInput(resourceReferenceConfig,requestParams,clientOptions,referenceId,TTL){const aggregateInputRepresentation={compositeRequest:[]};delete requestParams.clientOptions;// Remove clientOptions from the requestParams object since we don't want to parse it.
    let generatedUri=resourceReferenceConfig.urlTemplate.uri;// Fill out uri values - these are all required.
    const uriMappings=resourceReferenceConfig.urlTemplate.uriMappings;if(uriMappings){const uriMappingKeys=Object.keys(uriMappings);for(let n=0,len=uriMappingKeys.length;n<len;n++){const uriMappingKey=uriMappingKeys[n];const uriValueKey=uriMappings[uriMappingKey];const uriValue=requestParams[uriValueKey];if(uriValue!==undefined){generatedUri=generatedUri.replace("{"+uriValueKey+"}",uriValue);delete requestParams[uriValueKey];}}}// Fill out query string parameters.
    const requestParamKeys=Object.keys(requestParams);const queryMappings=resourceReferenceConfig.urlTemplate.queryMappings;const queryParameterBuilder=new URLBuilder();if(queryMappings){for(let n=0,len=requestParamKeys.length;n<len;n++){const requestParamKey=requestParamKeys[n];const queryMappingValue=queryMappings[requestParamKey];if(queryMappingValue){const requestParamValue=requestParams[requestParamKey];if(requestParamValue!==undefined){// If we pass in empty array, skip setting the query param.
    if(Array.isArray(requestParamValue)&&requestParamValue.length===0){continue;}queryParameterBuilder.set(queryMappingValue,requestParamValue);}}}generatedUri+=queryParameterBuilder.build();}const operationInput={url:generatedUri,referenceId};if(clientOptions&&clientOptions.eTagToCheck){operationInput.httpHeaders={};operationInput.httpHeaders["If-None-Match"]=`"${clientOptions.eTagToCheck}"`;}aggregateInputRepresentation.compositeRequest.push(operationInput);return aggregateInputRepresentation;}}/**
     * The singleton instance of the class.
     */const transportUtils=new TransportUtils();/**
     * Provides client-side caching functionality. Consumers read values from the cache via observables that the cache hands out: one observable maps to one cache value.
     * An observable can emit the following:
     * next:
     *      The cache value for the requested value.   If the value changes it will trigger another next.
     * error:
     *      An error was encountered when trying to provide a value. The value given as the error is a regular object, not an Error object. Reasons:
     *      1. it's what you get from the UI API, nothing more or less
     *      2. it's not being thrown, it's emitted
     *      3. stack trace is not required
     *      4. in a sense this is "data" even though it's data about an error so an object is appropriate
     * complete:
     *      Signals the observable has stopped (not because of an error) and will not be emitting any further values. This happens when a cache value is LRU'd out
     *      of the cache or when a value provider returns a 404 from the server.
     */class LdsCache{/**
         * Constructor.
         * @param cacheName The name for this cache. Used for info and scoping of some cache keys.
         * @param cacheStore LDS cache store
         * @param timeSource LDS time source
         * @param instrumentation instrumentation instance to log
         */constructor(cacheName,cacheStore,timeSource,instrumentation){Object.defineProperties(this,{_cacheName:{value:cacheName},_observablesMap:{value:new Map()},_dependenciesMap:{value:new Map(),writable:true},_valueProviderDebounceMap:{value:new Map()},_affectedKeyHandlersMap:{value:new Map()}});this.timeSource=timeSource;this.instrumentation=instrumentation;this._cacheStats=instrumentation.registerCacheStats(cacheName.replace(/\s+/g,"_"));this._cacheStore=cacheStore;this._serviceRegistry=new Map();// Set afterLruDequeueFn, which runs for every key LRU'd out of the cache
    this._cacheStore.setAfterLruDequeueFn(this._completeAndRemoveObservables.bind(this));}/**
         * DEPRECATED. We need to make this function private after all services have been fully converted to using
         * the LdsService abstract class. No service class should be calling this anymore.
         * Allows LDS modules to centrally register functions that can be handed out to value providers to respond to affected keys.
         * @param valueType The value type associated with a CacheKey.
         * @param handlerFn The function that should handle affected cache keys with the provided value type when they
         *      have been affected by a value provider's cache changes. The function should return a Thenable that resolves
         *      once the affected key has been handled.
         */registerAffectedKeyHandler(valueType,handlerFn){const{_affectedKeyHandlersMap}=this;{assert$1(!_affectedKeyHandlersMap.has(valueType),`An affected key handler has already been registered for ${valueType.toString()}`);}_affectedKeyHandlersMap.set(valueType,handlerFn);}/**
         * Allows LDS modules to centrally register functions that can be handed out to value providers to respond to affected keys.
         * @param valueType The value type associated with a CacheKey - required.
         * @returns handlerFn The function that should handle affected cache keys with the provided value type when they
         *      have been affected by a value provider's cache changes.
         */getAffectedKeyHandler(valueType){return this._affectedKeyHandlersMap.get(valueType);}/**
         * A convenience method for value providers that will iterate over the affected keys, look up the registered affected key
         * handler for each affected key, and invoke each handler.
         * @param affectedKeys An iterable of affected keys.
         * @param cacheAccessor The CacheAccessor in scope.
         * @returns An array of thenables handling each affected key.
         */handleAffectedKeys(affectedKeys,cacheAccessor){const thenables=[];const affectedKeysArray=Array.from(affectedKeys);for(let len=affectedKeysArray.length,n=0;n<len;n++){const affectedKey=affectedKeysArray[n];const valueType=affectedKey.getValueType();const affectedKeyValue=affectedKey.getKey();const affectedKeyHandlerFn=this.getAffectedKeyHandler(valueType);{assert$1(affectedKeyHandlerFn,`Handler function not found for affected key: ${affectedKeyValue}`);}if(affectedKeyHandlerFn){const thenable=affectedKeyHandlerFn(affectedKey,cacheAccessor);if(thenable){thenables.push(thenable);}}}return thenables;}/**
         * Method for getting affected keys from a dependency map.
         * @param keyStringsIterable The cache key string representations for which you want to get dependent keys.
         * @param dependenciesKeyStringMap The keys in the map are string representations of cache
         *      keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>) in
         *      the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes.
         * @param keyStringsToOmit Set of strings to omit from the affected keys.
         * @returns An array of affected keys.
         */getAffectedKeys(keyStringsIterable,dependenciesKeyStringMap,keyStringsToOmit){return collectionToArray(this._getTransitiveDependencies(keyStringsIterable,dependenciesKeyStringMap)).filter(keyString=>{// At this point the set of affected keys includes all the dependencies, including anything the consumer has just staged. Strip out the
    // stuff they have staged (puts/dependencies) since there is no point in them responding to that.
    if(keyStringsToOmit){return !keyStringsToOmit.has(keyString);}return true;}).map(keyString=>{return CacheKey.parse(keyString);}).filter(cacheKey=>{// We make this check because it's possible a dependency came from a prior session's cache (from durable store), but in the current
    // session we don't have a live Observable for this key yet.
    return !!this.getObservables(cacheKey);});}/**
         * Gets a value using the value provider and then caches it.
         * @param cacheKey The cache key.
         * @param valueProvider The value provider used to retrieve the value if it is not found in cache or needs to be refreshed.
         * @param finishedCallbacks Respective functions will be invoked on outcome of the get.
         * @returns The observable used to get the value and keep watch on it for changes.
         */get(cacheKey,valueProvider,finishedCallbacks){const keyString=cacheKey.getKey();const cacheKeyValueTypeString=cacheKey.getValueType();const cacheValueTtl=this.getService(cacheKey.getValueType()).getCacheValueTtl();const observables=this.getOrCreateObservables(cacheKey,cacheValueTtl);const cacheGetPerfMarker=this.instrumentation.markStartLDS("lds_cache_get",cacheKeyValueTypeString);const cacheAccessor=new CacheAccessor(this,this.timeSource);if(this._debounceOrTrackValueProvider(cacheKey,valueProvider)){return observables.finalTransformed;}let finishedExecuted=false;const finished=error$$1=>{{this._untrackValueProvider(cacheKey,valueProvider);}// Invoke any applicable callbacks.
    if(finishedCallbacks){if(finishedCallbacks.errorCallback&&error$$1){finishedCallbacks.errorCallback(error$$1);}else if(finishedCallbacks.successCallback){finishedCallbacks.successCallback();}}finishedExecuted=true;};this._cacheStore.get(cacheKey).then(valueWrapper=>{this.instrumentation.markEndLDS(cacheGetPerfMarker);// Cache get performance tracker
    const valueProviderPerfMarker=this.instrumentation.markStartLDS("lds_cache_value_provider",cacheKeyValueTypeString);const valueProviderPerfMarkerPerfContext=valueProviderPerfMarker.perfContext;{assert$1(!valueProvider.hasProvided,`Value provider for key ${keyString} has already been used once before. Value provider instances should not be reused so that debouncing logic is not negatively impacted.`);}return valueProvider.provide(cacheAccessor).then(valueProviderResult=>{// return so the Thenable will remain part of the outer Thenable chain.
    let callbackError;try{if(valueProviderResult===ValueProviderResult.CACHE_MISS){// With LDS now supporting delete record, there are scenarios where we are returning a CACHE_MISS but do not have anything staged for emit
    // as a temporary solution, I'm removing the below assert. I will follow this up in the next design meeting
    // This was not discovered previously because we have an issue with our record-ui-emulator which is now fixed
    // assert(cacheAccessor.isEmitStaged(cacheKey), `If this was a miss we should have an emit staged for the cache key: ${keyString}`);
    {// tslint:disable-next-line:no-console
    console.log(`Cache miss for '${keyString}'; value is provided.`);}this._cacheStats.logMisses();cacheAccessor.finishCacheAccessor();valueProviderPerfMarkerPerfContext.keyStatus="cache_miss";}else if(valueProviderResult===ValueProviderResult.CACHE_HIT){{assert$1(cacheAccessor.stagedEmitsCount===0,`There shouldn't be any staged emits on a cacheAccessor for a cache hit, with key ${keyString}`);// tslint:disable-next-line:no-console
    console.log(`Cache hit for '${keyString}'`);}this._cacheStats.logHits();valueProviderPerfMarkerPerfContext.keyStatus="cache_hit";}else if(valueProviderResult===ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED){this._cacheStats.logMisses();// This was a 304 unchanged, so update the ValueWrapper.lastFetchTime and emit. Consumers of LDS don't care about lastFetchTime so
    // emits get squashed by distinctUntilChanged because the actual value inside the ValueWrapper hasn't changed.
    // We also don't invoke affected key handlers for the same reason.
    const newValueWrapper=cacheAccessor.newValueWrapper(valueWrapper.value,valueWrapper.eTag,valueWrapper.extraInfoObject);cacheAccessor.stagePut([],cacheKey,newValueWrapper,newValueWrapper.value);cacheAccessor.commitPuts();cacheAccessor.finishCacheAccessor();valueProviderPerfMarkerPerfContext.keyStatus="cache_miss_refresh_unchanged";}else{{assert$1(false,`Invalid valueProviderResult returned from value provider: ${valueProviderResult}`);}}}catch(error$$1){callbackError=error$$1;valueProviderPerfMarkerPerfContext.keyStatus="cache_error";// Anything bad happening in this try block would be an LDS bug. Rethrow here as opposed to let the onRejected handler
    // handle it because we don't want Observables to get these errors (they can't really handle them). Rethrow here (as
    // opposed to logError()) so that the UI will display an error overlay that will be hard to miss, as well as gack.
    throw error$$1;}finally{finished(callbackError);this.instrumentation.markEndLDS(valueProviderPerfMarker);// ValueProvider performance tracker
    }});}).catch(error$$1=>{if(!finishedExecuted){finished({error:error$$1});}this._handleValueProviderError(observables.root,cacheKey,error$$1);});return observables.finalTransformed;}/**
         * Returns a Thenable that resolves the value, or undefined, from this cacheStore.
         * @param cacheKey The cache key for the value you want to get.
         * @returns Resolves when the value from the cacheStore returns.
         */getValue(cacheKey){return this._cacheStore.get(cacheKey);}/**
         * Puts the cached object using the provided key.
         * @param cacheKey The cache key for the value you want to put - required.
         * @param value The cache value to put.
         * @returns Resolves when the put has completed.
         */put(cacheKey,value){return this._cacheStore.put(cacheKey,value);}/**
         * Puts all the values stored in the map into the cache.
         * @param cacheKeyToValueMap  Map of cacheKeys to values to store into cache.
         *      Values can be falsy and still be cached with the exception of undefined, which is treated as a removed
         *      or non-existent value.
         * @returns Resolves when all the puts have finished.
         */putAll(cacheKeyToValueMap){return this._cacheStore.putAll(cacheKeyToValueMap);}/**
         * Evicts a value from all cache stores.
         * @param cacheKey The cache key - required.
         * @returns The Thenable which will be resolved once the evict is completed. Resolves to the Observable
         *      representing the value if it was found in the cache, otherwise undefined.
         */evict(cacheKey){const perfMarker=this.instrumentation.markStartLDS("lds_cache_evict",cacheKey.getValueType());return this._cacheStore.evict(cacheKey).then(()=>{this.instrumentation.markEndLDS(perfMarker);// Perf tracker for cache eviction
    const observables=this.getObservables(cacheKey);return observables?observables.finalTransformed:undefined;});}/**
         * Evicts a value from all cache stores and deletes the observable.
         * @param cacheKey The cache key.
         * @returns The Thenable which will be resolved once the evict is completed. Resolves to the Observable
         *      representing the value if it was found in the cache, otherwise undefined.
         */evictAndDeleteObservable(cacheKey){const perfMarker=this.instrumentation.markStartLDS("lds_cache_evict_complete_observables",cacheKey.getValueType());const{_cacheStore}=this;return _cacheStore.evict(cacheKey).then(didEvict=>{let observable;if(didEvict){const observables=this.getObservables(cacheKey);const rootObservable=observables?observables.root:undefined;if(rootObservable){const error$$1=get404TransportResponse();rootObservable.emitError(error$$1,this.instrumentation);}const cacheAccessor=new CacheAccessor(this,this.timeSource);const affectedCacheKeysArray=this.getAffectedKeys([cacheKey.getKey()],this._dependenciesMap);this.handleAffectedKeys(affectedCacheKeysArray,cacheAccessor);this.deleteObservables(cacheKey);observable=observables?observables.finalTransformed:undefined;}this.instrumentation.markEndLDS(perfMarker);// Perf tracker for cache eviction
    // This will be undefined if there was nothing to evict!
    return observable;});}/**
         * @returns The name of the cache which is used for info and scoping of certain cache keys.
         */get cacheName(){return this._cacheName;}/**
         * Gets the observable for the CacheKey if one exists.
         * @param cacheKey The cache key for the Observable's value.
         * @returns The core observables for the cache key or undefined if there aren't any.
         */getObservables(cacheKey){const keyString=cacheKey.getKey();const observables=this._observablesMap.get(keyString);return observables;}/**
         * Gets the observable for the CacheKey, creating one if necessary.
         * @param cacheKey The cache key for the Observable.
         * @param cacheValueTtl TTL of the value to be cached
         * @returns The core observables for the cache key.
         */getOrCreateObservables(cacheKey,cacheValueTtl){let observables=this.getObservables(cacheKey);if(observables===undefined){const keyString=cacheKey.getKey();observables=new CoreObservables();const observable=new Observable("RootObservable: "+keyString);observables.root=observable;observables.changesOnly=observable.distinctUntilChanged((oldValueWrapper,newValueWrapper)=>{if(observables&&observables.changesOnly.subscriptions.size>0){// TODO: we may not need this subscriptions check anymore as it's being done in the observable transform functions (I think?).
    // Double check this and remove if possible.
    // If the changesOnly Observable has any subscriptions then do an actual equivalency check, otherwise
    // don't do an equivalency check for performance reasons.
    // TODO: W-4434441 - choose the best equivalency method based on the cache key's value type.
    // Compare the non-proxy, non-read-only values. Do this because traversing the entire value structure
    // of a proxy takes way too long.
    return equivalent(oldValueWrapper,newValueWrapper);}return false;});observables.finalTransformed=observables.changesOnly.mapWithFilterOnSubscribeBehaviorSubject(value=>{let shouldEmit=false;if(this.timeSource.now()<value.lastFetchTime+cacheValueTtl){shouldEmit=true;}else{// TTL expired, we are refreshing the value, remove it from the set once the new value is back
    lastValueTracker.add(value);}return shouldEmit;},valueWrapper=>{return toReadOnly(valueWrapper.value);});this._observablesMap.set(keyString,observables);}return observables;}/**
         * Checks if there is an observable for the given cache key.
         * @param cacheKey The key with which to lookup if there are any existing core observables set for.
         * @returns True if the core observables for the record exists, otherwise false.
         */hasObservable(cacheKey){const keyString=cacheKey.getKey();const{_observablesMap}=this;const hasObservable=!!_observablesMap.get(keyString);{assert$1(hasObservable===_observablesMap.has(keyString),`Somehow we had a key in the observable map with no observer: ${keyString}`);}return hasObservable;}/**
         * Deletes the observables identified by the given cacheKey.
         * @param cacheKey The key for the core observables.
         * @returns void
         */deleteObservables(cacheKey){const keyString=cacheKey.getKey();this._observablesMap.delete(keyString);}/**
         * Returns true if the given cacheKey or dependent keys have subscribed observers.
         * @param cacheKey The key for a cache value.
         * @returns True if the given cacheKey or dependent keys have subscribed observers.
         */hasDirectOrTransitiveObserver(cacheKey){const keyString=cacheKey.getKey();const keysStringsToCheckSet=new UsefulSet();keysStringsToCheckSet.add(keyString);const dependentKeyStringsSet=this._dependenciesMap.get(keyString);let result=false;if(dependentKeyStringsSet&&dependentKeyStringsSet.size>0){keysStringsToCheckSet.addAll(dependentKeyStringsSet);}const keysStringToCheckArray=Array.from(keysStringsToCheckSet);for(let len=keysStringToCheckArray.length,n=0;n<len;n++){const cacheKeyToCheck=CacheKey.parse(keysStringToCheckArray[n]);const observables=this.getObservables(cacheKeyToCheck);if(observables){// We need to check the root observable because anyone who is subscribed to an observable chain with an active subscription
    // will have to be subscribed off the root no matter what.
    const rootObservable=observables.root;if(rootObservable&&rootObservable.subscriptions.size>0){result=true;break;}}}return result;}/**
         * Clears dependencies and inverse dependencies for a given cacheKey.
         * In the case where we have the following dependency relationship, and Record 2 has been deleted from ui-api/evicted from cache, we want
         * to remove the dependency from Record 1 => 2 as well, so that affectedKeyHandlers for Record 1 are correct.
         * Record 1 => Record 2
         * Record 2 => RecordUI
         * @param cacheKey The key for a cache value.
         */clearDependencies(cacheKey){const keyString=cacheKey.getKey();const cacheDepsCacheKey=new LdsCacheDependenciesCacheKeyBuilder().setLdsCacheName(this.cacheName).build();return this._cacheStore.get(cacheDepsCacheKey).then(dependencyMapCacheValue=>{delete dependencyMapCacheValue.dependencies[keyString];this._dependenciesMap.delete(keyString);const inverseDependencies=dependencyMapCacheValue.inverseDependencies[keyString];if(inverseDependencies){// Use the inverse dependency map to remove any dependencies on the dependency being cleared.
    for(let inverseDependencyLen=inverseDependencies.length,i=0;i<inverseDependencyLen;i++){const inverseDependency=inverseDependencies[i];const inverseDependencyDependencies=dependencyMapCacheValue.dependencies[inverseDependency];// Make sure there is an actual dependency, there is a case where record ui points to a record that has been deleted.
    if(inverseDependencyDependencies){for(let dependencyLen=inverseDependencyDependencies.length,j=0;j<dependencyLen;j++){const inverseDependencyDependency=inverseDependencyDependencies[j];if(inverseDependencyDependency===keyString){// Remove the inverse dependency on depsObject
    inverseDependencyDependencies.splice(j,1);if(inverseDependencyDependencies.length===0){delete dependencyMapCacheValue.dependencies[inverseDependency];}// Remove the inverse dependency on lds's copy.
    const dependencyMap=this._dependenciesMap.get(inverseDependency);if(dependencyMap){dependencyMap.delete(inverseDependencyDependency);if(dependencyMap.size===0){this._dependenciesMap.delete(inverseDependency);}}}}}}// Remove the inverse dependency because we removed them all.
    delete dependencyMapCacheValue.inverseDependencies[keyString];}return this._cacheStore.put(cacheDepsCacheKey,dependencyMapCacheValue);});}/**
         * Sets the dependenciesMap.
         * @param dependenciesMap The value to set as the dependenciesMap.
         */setDependenciesMap(dependenciesMap){this._dependenciesMap=dependenciesMap;}/**
         * Stage puts the given value using the given cacheAccessor based associated to the given valueType.
         * @param valueType The value type associated to the given value.
         * @param dependentCacheKeys A list of cache keys that rely on the given value.
         * @param value The value to stage put.
         * @param cacheAccessor The cache accessor to stage put the value into.
         * @param additionalData An optional property bag object that can be consumed by an actual service implimentation of stagePutValue.
         * @returns The value that will be put into the cache. This can be the same or be different from the given value depending on the implimenting service.
         *
         * @throws TransportResponse - Throws when a service is not found for the given valueType. This is a programmer error!
         */stagePutValue(valueType,dependentCacheKeys,value,cacheAccessor,additionalData){const service$$1=this._serviceRegistry.get(valueType);if(!service$$1){throw getLdsInternalError("SERVICE_NOT_FOUND","Could not find service for valueType: "+valueType.toString(),true);}return service$$1.stagePutValue(dependentCacheKeys,value,cacheAccessor,additionalData);}/**
         * Strips eTags from the given value associated with the given valueType.
         * @param valueType The value type associated to the given value.
         * @param value The value from which to strip the eTags.
         * @returns The given value stripped of all eTags.
         *
         * @throws TransportResponse - Throws when a service is not found in the registry for the given valueType. This is a programmer error!
         */stripETagsFromValue(valueType,value){const service$$1=this._serviceRegistry.get(valueType);if(!service$$1){throw getLdsInternalError("SERVICE_NOT_FOUND","Could not find service for valueType: "+valueType.toString(),true);}return service$$1.stripETagsFromValue(value);}/**
         * Registers a service associated to a specific value type with the cache.
         * @param service The service to register with the cache.
         *
         * @throws TransportResponse - Throws when a service has already been registered for the given valueType. This is a programmer error!
         */registerService(service$$1){const valueTypes=service$$1.getValueTypes();valueTypes.forEach(valueType=>{if(this._serviceRegistry.has(valueType)){throw getLdsInternalError("SERVICE_ALREADY_REGISTERED","A service has already been registered for valueType: "+service$$1.getValueTypes().toString(),true);}this._serviceRegistry.set(valueType,service$$1);// Register any affected key handler.
    const affectedKeyHandler=service$$1.getAffectedKeyHandler();if(affectedKeyHandler){this.registerAffectedKeyHandler(valueType,affectedKeyHandler);}});}/**
         * @param valueType The value type associated to the service to get.
         * @returns The service instance that has been registered to the given value type.
         *
         * @throws TransportResponse - Throws when a service is not found for the given valueType. This is a programmer error!
         */getService(valueType){const service$$1=this._serviceRegistry.get(valueType);if(service$$1===undefined){throw getLdsInternalError("SERVICE_NOT_FOUND","Could not find service for valueType: "+valueType.toString(),true);}return service$$1;}/**
         * Given a key, returns the value provider type for that key.
         * @param key The string representation of the value provider.
         * @returns Returns the value provider type for that key.
         */getValueTypeForKey(key){return key;}/**
         * Handles any value provider errors by doing the appropriate action on the given observable.
         * @param observable The observable to act on.
         * @param cacheKey The cache key associated with the value provider that threw an error.
         * @param readOnlyError The error wrapped in a read-only membrane.
         */_handleValueProviderError(observable,cacheKey,readOnlyError){observable.emitError(readOnlyError,this.instrumentation);this.deleteObservables(cacheKey);if(readOnlyError.status===404){// Remove object from cache and clear out the dependencies.
    this.evict(cacheKey).then(()=>{this.clearDependencies(cacheKey);}).catch(err=>{{// tslint:disable-next-line:no-console
    console.log(`Error evicting or clearing dependencies for cacheKey=${cacheKey}. err=${JSON.stringify(err)}`);}});{// tslint:disable-next-line:no-console
    console.log("Cache eviction for cacheKey="+cacheKey.getKey()+" because of server 404.");}}else{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log("Exception encountered in value provider: ",readOnlyError);}}}/**
         * If there are observables in the cache that match the given keys, calls complete on those observables.
         * @param cacheKeys Cache keys of the observables to remove and
         *      complete because they have been removed from the cache and are no longer managed by it.
         */_completeAndRemoveObservables(cacheKeys){{handleDebug("complete-and-remove-observables",()=>{return {cacheKeys};});}for(let len=cacheKeys.length,n=0;n<len;n++){const cacheKey=cacheKeys[n];const observables=this.getObservables(cacheKey);if(observables){const rootObservable=observables.root;if(rootObservable&&rootObservable.complete){rootObservable.complete();// Remove observable for the map, so that we never try to emit to this completed observable in the future
    this.deleteObservables(cacheKey);}}}}/**
         * Returns true if an equal value provider is already in-flight (tracked), otherwise returns false and tracks the value provider
         * and cache key combination for the duration of a get() operation for the purpose of debouncing simultaneous equivalent get() operations.
         * @param cacheKey The cache key.
         * @param valueProvider The provider used to retrieve the value if it is not found in cache or needs to be refreshed.
         * @returns True if an equal value provider is already in flight (tracked), otherwise false.
         */_debounceOrTrackValueProvider(cacheKey,valueProvider){const keyString=cacheKey.getKey();const{_valueProviderDebounceMap}=this;let inFlightValueProviders=_valueProviderDebounceMap.get(keyString);if(inFlightValueProviders===undefined){inFlightValueProviders=new UsefulSet();_valueProviderDebounceMap.set(keyString,inFlightValueProviders);}const inFlightValueProvidersArray=Array.from(inFlightValueProviders);for(let len=inFlightValueProvidersArray.length,n=0;n<len;n++){const inFlightValueProvider=inFlightValueProvidersArray[n];if(valueProvider.equals(inFlightValueProvider)&&inFlightValueProvider.equals(valueProvider)){return true;}}inFlightValueProviders.add(valueProvider);return false;}/**
         * Stops tracking this in-flight value provider for the purpose of debouncing simultaneous equivalent get() operations.
         * @param cacheKey The cache key.
         * @param valueProvider The provider used to retrieve the value if it is not found in cache or needs to be refreshed.
         */_untrackValueProvider(cacheKey,valueProvider){const keyString=cacheKey.getKey();const{_valueProviderDebounceMap}=this;const inFlightValueProviders=_valueProviderDebounceMap.get(keyString);{assert$1(inFlightValueProviders!==undefined,`Expected to find tracked value providers for ${keyString}`);}if(inFlightValueProviders){inFlightValueProviders.delete(valueProvider);if(inFlightValueProviders.size===0){_valueProviderDebounceMap.delete(keyString);}}}/**
         * Takes a set of key string representations and a dependency map and builds a set of all the transitive dependencies for
         * this input (as key string representations). Note that the output may need to be further filtered because this doesn't account
         * for keys you might not want to return, because they are already part of a cache transaction for example.
         * @param keyStringsIterable The cache key string representations for which you want to get dependent keys.
         * @param dependenciesKeyStringMap The keys in the map are string representations of cache
         *      keys and the values are sets of string representations of cache keys. A given entry value (UsefulSet<string>) in
         *      the map represents the known cache keys that are affected when the value represented by the entry key in the
         *      map changes.
         * @return A set containing all of the transitive dependent keys as key string representations for the given
         *      cache key strings.
         */_getTransitiveDependencies(keyStringsIterable,dependenciesKeyStringMap){const transitiveDepsSet=new UsefulSet();const dependencySetsToProcess=[];const keyStringsArray=Array.from(keyStringsIterable);for(let len=keyStringsArray.length,n=0;n<len;n++){const keyString=keyStringsArray[n];const nextSet=dependenciesKeyStringMap.get(keyString);if(nextSet){dependencySetsToProcess.push(nextSet);}}while(dependencySetsToProcess.length>0){const dependencySet=dependencySetsToProcess.shift();if(dependencySet){const dependencySetArray=Array.from(dependencySet.values());for(let len=dependencySetArray.length,n=0;n<len;n++){const keyString=dependencySetArray[n];if(!transitiveDepsSet.has(keyString)){transitiveDepsSet.add(keyString);const nextSet=dependenciesKeyStringMap.get(keyString);if(nextSet){dependencySetsToProcess.push(nextSet);}}}}}return transitiveDepsSet;}}/**
     * A base service implimentation of ILdsService. Services should extend this class.
     */class LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param valueTypes The valueTypes which this services is associated.
         */constructor(ldsCache,valueTypes){this._ldsCache=ldsCache;this._valueTypes=valueTypes;}/**
         * @returns The value type with which the service is associated.
         */getValueTypes(){return this._valueTypes;}/**
         * @returns The affected key handler for the service or null if the service doesn't need one (default).
         */getAffectedKeyHandler(){return null;}}/**
     * Used to directly access underlying the cache store(s) using during a single cache transaction.
     */class ValueProvider{/**
         * Constructs a new ValueProvider.
         * @param provideFn The function that will provide a new value.
         * @param parameters The parameters for this value provider.
         * @param equalsFn An optional function that will compare one value provider to another
         *      value provider and return true if they are equal. This is used to debounce value provider calls.
         */constructor(provideFn,parameters,equalsFn){Object.defineProperties(this,{_provideFn:{value:provideFn},_parameters:{value:parameters},_equalsFn:{value:equalsFn?equalsFn:otherValueProvider=>{const thisParamsString=JSON.stringify(this.parameters);const thatParamsString=JSON.stringify(otherValueProvider.parameters);return thisParamsString===thatParamsString;}},_hasProvided:{value:false,writable:true}});}/**
         * Provides a Thenable that resolves to a ValueProviderResult marker. Along the way this should stage puts and do
         * other necessary cache operations against the CacheAccessor provided as a parameter.
         * @param cacheAccessor The relevant CacheAccessor for this function.
         * @returns The value provider result.
         */provide(cacheAccessor){try{{assert$1(!this._hasProvided,"Value provider instances should not be reused.");}return this._provideFn(cacheAccessor,this._parameters);}finally{this._hasProvided=true;}}/**
         * An optional function that will compare this value provider to other value providers and return true if they are
         * equal. This is used to debounce value provider calls.
         * @param otherValueProvider Another value provider to compare this one against.
         * @returns True if the value providers are equal.
         */equals(otherValueProvider){return this._equalsFn.call(this,otherValueProvider);}/**
         * @returns The parameters for this value provider.
         */get parameters(){return this._parameters;}/**
         * @returns True if the value provider has been run, else false. Value provider instances should not be reused.
         */get hasProvided(){return this._hasProvided;}}/**
     * A {@link CacheStore} implementation that is backed by an in memory map and LRU queue to make sure we only keep a
     * certain number of objects in memory. This store's APIs return synchronous Thenables where possible.
     */class InMemoryCacheStore{/**
         * Constructor.
         * @param delegateBackingStore - Reserved for future use - a backing store.
         * @param lruSize - The size to make the lru, in bytes.
         */constructor(delegateBackingStore,lruSize){Object.defineProperties(this,{delegateBackingStore:{value:delegateBackingStore},lruSize:{value:lruSize},afterLruDequeueFn:{value:null,writable:true},privateMap:{value:new Map()},lruQueue:{value:new MappedQueue()}});}/**
         * A function that will be called whenever something is leaving the in memory store due to LRU. It will be passed
         * an array of string keys (one or more).
         * @param fn A function that will be called whenever something is leaving the in memory store due to LRU.
         */setAfterLruDequeueFn(fn){this.afterLruDequeueFn=fn;}// @see {@link CacheStore#put}.
    put(cacheKey,value){const removedCacheKey=this._putInMemoryMapAndAdjustLru(cacheKey,value);let thenable;if(this.delegateBackingStore){thenable=this.delegateBackingStore.put(cacheKey,value);}else{thenable=ThenableFactory.resolve(undefined);}if(removedCacheKey&&this.afterLruDequeueFn){this.afterLruDequeueFn([removedCacheKey]);}return thenable;}// @see {@link CacheStore#putAll}.
    putAll(cacheKeyToValueMap){const removedCacheKeys=[];for(const[cacheKey,value]of cacheKeyToValueMap.entries()){const removedCacheKey=this._putInMemoryMapAndAdjustLru(cacheKey,value);if(removedCacheKey){removedCacheKeys.push(removedCacheKey);}}let thenable;if(this.delegateBackingStore){thenable=this.delegateBackingStore.putAll(cacheKeyToValueMap);}else{thenable=ThenableFactory.resolve(undefined);}if(removedCacheKeys.length>0&&this.afterLruDequeueFn){this.afterLruDequeueFn(removedCacheKeys);}return thenable;}// @see {@link CacheStore#evict}.
    evict(cacheKey){const keyString=cacheKey.getKey();const found=this.privateMap.has(keyString);if(found){this.privateMap.delete(keyString);this.lruQueue.remove(keyString);}if(this.delegateBackingStore){return this.delegateBackingStore.evict(cacheKey).then(foundInBackingStore=>{return foundInBackingStore||found;});}return ThenableFactory.resolve(found);}// @see {@link CacheStore#get}.
    get(cacheKey){const keyString=cacheKey.getKey();const value=this.privateMap.get(keyString);let removedCacheKey;let thenable;if(value!==undefined){// null and other non-undefined falsy values are ok.
    this.lruQueue.enqueue(keyString,null);thenable=ThenableFactory.resolve(value);}else if(this.delegateBackingStore){thenable=this.delegateBackingStore.get(cacheKey);thenable.then(storeValue=>{if(storeValue!==undefined){// null and other non-undefined falsy values are ok.
    removedCacheKey=this._putInMemoryMapAndAdjustLru(cacheKey,storeValue);}if(removedCacheKey&&this.afterLruDequeueFn){this.afterLruDequeueFn([removedCacheKey]);}return storeValue;});}else{// Resolve to undefined if not found in memory or a backing store.
    thenable=ThenableFactory.resolve(undefined);}return thenable;}// @see {@link CacheStore#getAll}.
    getAll(cacheKeysArray){const valuesMap=new Map();const missingCacheKeys=[];cacheKeysArray.forEach(cacheKey=>{const keyString=cacheKey.getKey();const value=this.privateMap.get(keyString);if(value!==undefined){// null and other non-undefined falsy values are ok.
    valuesMap.set(cacheKey,value);this.lruQueue.enqueue(keyString,null);}else{missingCacheKeys.push(cacheKey);}});let thenable;if(this.delegateBackingStore&&missingCacheKeys.length>0){thenable=this.delegateBackingStore.getAll(missingCacheKeys).then(storeValues=>{const removedCacheKeys=[];storeValues.forEach((storeValue,storeKey)=>{if(storeValue!==undefined){// null and other non-undefined falsy values are ok.
    valuesMap.set(storeKey,storeValue);const removedCacheKey=this._putInMemoryMapAndAdjustLru(storeKey,storeValue);if(removedCacheKey){removedCacheKeys.push(removedCacheKey);}}});if(removedCacheKeys.length>0&&this.afterLruDequeueFn){this.afterLruDequeueFn(removedCacheKeys);}return valuesMap;});}else{thenable=ThenableFactory.resolve(valuesMap);}return thenable;}/**
         * @returns The number of items currently in the cache store..
         */getNumberOfItems(){return this.privateMap.size;}/**
         * Puts a value into the map that backs this in memory cache store.
         * @param cacheKey The key for the value.
         * @param value The value to put.
         * @returns The cache key for any value that is pushed out of the cache store due to LRU, or null if there wasn't any.
         */_putInMemoryMapAndAdjustLru(cacheKey,value){const keyString=cacheKey.getKey();this.privateMap.set(keyString,value);this.lruQueue.enqueue(keyString,null);if(this.lruQueue.getSize()>this.lruSize){const entry=this.lruQueue.dequeue();if(entry!==undefined){this.privateMap.delete(entry[0]);return CacheKey.parse(entry[0]);}}return null;}}/**
     * Default time source. Uses Date to measure time.
     */class DefaultTimeSource{/**
         * @returns The current time as defined by Date.now().
         */now(){return Date.now();}}/**
     * Constructs a cache key for the RECORD_VALUE_TYPE. Keys are constructed from recordId
     */class RecordCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(RECORD_VALUE_TYPE);}/**
         * Sets the recordId.
         * @param recordId The record id.
         * @returns "CacheKeyBuilder" which makes this method chainable.
         */setRecordId(recordId){this.recordId=recordId;return this;}/**
         * Builds the CacheKey.
         * @returns  A new CacheKey which represents a RECORD_VALUE_TYPE.
         */build(){{assert$1(this.recordId,"Non-empty recordId must be provided.");assert$1(this.recordId.length===18,"Record Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this.recordId}`);}}/**
     * Utility functions for dealing with markers.
     */class CacheValueMarkerUtils{/**
         * Creates and returns a new marker object which consists of a ___marker, timestamp, and set of properties defined by the keyValueMap.
         * @param keyValueMap Map of properties to set on the marker object.
         * @param timestamp Optional. Timestamp for the marker. If not specified will use the current time.
         * @returns See description.
         */makeMarker(keyValueMap,timestamp){timestamp=timestamp||new Date().getTime();const marker={___marker:true,timestamp};if(keyValueMap){keyValueMap.forEach((value,key)=>{marker[key]=value;});}return marker;}/**
         * Examines an object to see if it appears to be a normalization marker.
         * @param object An object to inspect to see if it is a marker.
         * @returns True if the provided object is a marker, otherwise false.
         */isMarker(object){return object&&object.___marker===true;}/**
         * Examines an object to see if it appears to be a normalization marker.
         * Note this can't be included in record-marker-utils because that would cause a loop
         * between that class and record-service-utils.
         * @param object An object to inspect to see if it is a record marker.
         * @returns True if the provided object is a marker for a record, otherwise false.
         */isRecordMarker(object){return this.isMarker(object)&&object.id&&object.fields!==undefined;}}/**
     * CacheValueMarkerUtils - The singleton instance of the class.
     */const cacheValueMarkerUtils=new CacheValueMarkerUtils();/**
     * Constructs a cache key for the ObjectInfo value type from objectApiName
     */class ObjectInfoCacheKeyBuilder extends CacheKeyBuilder{/*
         * Constructor.
         */constructor(){super(OBJECT_INFO_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName.toLowerCase();return this;}/**
         * Builds the cache key using objectApiName.
         * @returns A new cache key representing the ObjectInfo value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");}return new CacheKey(this.getValueType(),`${this.objectApiName}`);}}/**
     * Provides functionality to read object info data from the cache. Can refresh the data from the server.
     */class ObjectInfoService extends LdsServiceBase{constructor(ldsCache){super(ldsCache,[OBJECT_INFO_VALUE_TYPE]);}getCacheValueTtl(){return OBJECT_INFO_TTL;}/**
         * Gets an object info.
         * @param objectApiName The API name of the object to retrieve.
         * @returns An observable of the object info.
         */getObjectInfo(objectApiName){objectApiName=getObjectApiName(objectApiName);const cacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();const valueProviderParameters={cacheKey,objectApiName};const valueProvider=this._getValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Stage puts the given object info.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param objectInfo The object info value to cache.
         * @param cacheAccessor An object to access cache directly.
         * @returns A Thenable which resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,objectInfo,cacheAccessor){const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectInfo.apiName).build();return cacheAccessor.get(objectInfoCacheKey).then(existingValueWrapper=>{const eTag=objectInfo.eTag;if(existingValueWrapper&&existingValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(objectInfoCacheKey);}// Strip out the eTag from the value. We don't want to emit eTags!
    objectInfo=this.stripETagsFromValue(objectInfo);return cacheAccessor.stagePut(dependentCacheKeys,objectInfoCacheKey,objectInfo,objectInfo,{eTag});});}/**
         * Strips all eTag properties from the given objectInfo by directly deleting them.
         * @param objectInfo The objectInfo from which to strip the eTags.
         * @returns The given objectInfo with its eTags stripped.
         */stripETagsFromValue(objectInfo){delete objectInfo.eTag;return objectInfo;}/**
         * Creates the ValueProvider for the ObjectInfo by taking ObjectInfoValueProviderParams as input
         * returns Value Provider instance of the objectInfo
         * @param valueProviderParams Parameters to create Value Provider for ObjectInfo
         */_getValueProvider(valueProviderParams){const valueProvider=new ValueProvider((cacheAccessor,valueProviderParameters)=>{const{cacheKey,objectApiName,localFreshObjectInfo,forceProvide}=valueProviderParameters;if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,localFreshObjectInfo);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+OBJECT_INFO_TTL;if(needsRefresh){// Value is stale, get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,localFreshObjectInfo,existingValueWrapper.eTag);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value, get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,localFreshObjectInfo);});},valueProviderParams);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the object info.
         * @param objectApiName The object API name for the object info.
         * @param localFreshObjectInfo A ObjectInfo value you want explicitly put into cache instead of getting the value from the server.
         * @param eTagToCheck eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns Returns a thenable of ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,localFreshObjectInfo,eTagToCheck){let transportResponseThenable;// If the objectInfo is provided, we don't go to the server to fetch it.
    if(localFreshObjectInfo){transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshObjectInfo));}else{const params={objectApiName};if(eTagToCheck){params.clientOptions={eTagToCheck};}if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getObjectInfo",params,OBJECT_INFO_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getObjectInfo",params);}}return transportResponseThenable.then(transportResponse=>{// Cache miss refresh unchanged.
    if(transportResponse.status===304){return ThenableFactory.resolve(ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED);}return ThenableFactory.resolve(undefined).then(()=>{const freshValue=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);return this.stagePutValue([],freshValue,cacheAccessor);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Represents an object that is used as a normalization marker. Extend this class to create specialized markers.
     */class CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         */constructor(timestamp){/**
             * A special property indicating the object is a marker. Useful for deserialization from json!
             */this.___marker=true;this.timestamp=timestamp;}}/**
     * Cache value marker for object info.
     */class ObjectInfoCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param objectApiName The objectApiName for the marker.
         * @param eTag The eTag for the marker.
         */constructor(timestamp,objectApiName,eTag){super(timestamp);this.objectApiName=objectApiName;this.eTag=eTag;}}/**
     * Builds a CacheValueMarker specified by a given set of parameters.
     */class CacheValueMarkerBuilder{/**
         * Sets the timestamp of the marker.
         * @param timestamp The timestamp to set on the marker.
         */setTimestamp(timestamp){this._timestamp=timestamp;return this;}/**
         * Builds an CacheValueMarker using the assigned parameters.
         * @returns A new CacheValueMarker with the given parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");}return new CacheValueMarker(this._timestamp);}}/**
     * Constructs an ObjectInfoCacheValueMarker.
     */class ObjectInfoCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the objectApiName for the marker
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Sets the eTag for the marker.
         * @param eTag The eTag for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Builds an ObjectInfoCacheValueMarker using the assigned parameters.
         * @returns A new ObjectInfoCacheValueMarker with the given parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._objectApiName,"A non-empty objectApiName must be set.");}return new ObjectInfoCacheValueMarker(this._timestamp,this._objectApiName,this._eTag);}}/**
     * Map between target values and refresh promise function
     */const wiredTargetValueToConfigMap=new WeakMap();/**
     * Generates a new wire adapter.
     * @param service Function to invoke, with the resolved configuration, to get an observable or undefined.
     * @returns The new wire adapter.
     */function generateWireAdapter(service$$1){return wiredEventTarget=>{let subscription;let config;// initialize the wired property with a properly shaped object so cmps can use <template if:true={wiredProperty.data}>
    wiredEventTarget.dispatchEvent(new wireService.ValueChangedEvent({data:undefined,error:undefined}));function unsubscribe(){if(subscription){subscription.unsubscribe();subscription=undefined;}}const refreshCallback=()=>{return new Promise((resolve,reject)=>{const metaConfig={forceProvide:true,finishedCallbacks:{successCallback:resolve,errorCallback:reject}};service$$1(config,metaConfig);});};const observer={next:data=>{const wiredTargetValue={data,error:undefined};wiredTargetValueToConfigMap.set(wiredTargetValue,refreshCallback);wiredEventTarget.dispatchEvent(new wireService.ValueChangedEvent(wiredTargetValue));},error:error$$1=>{const wiredTargetValue={data:undefined,error:error$$1};wiredTargetValueToConfigMap.set(wiredTargetValue,refreshCallback);wiredEventTarget.dispatchEvent(new wireService.ValueChangedEvent(wiredTargetValue));unsubscribe();},complete:unsubscribe};wiredEventTarget.addEventListener("connect",()=>{// if already subscribed or no config set then noop
    if(subscription||!config){return;}// no subscription (eg was disconnected so subscription released) so get a new one
    const serviceResult=service$$1(config);if(serviceResult){if(serviceResult.then){const thenable=serviceResult;thenable.then(observable=>{if(observable){subscription=observable.subscribe(observer);}}).catch(err=>{if(observer.error){observer.error(err);}});}else{const observable=serviceResult;subscription=observable.subscribe(observer);}}});wiredEventTarget.addEventListener("disconnect",()=>{unsubscribe();});wiredEventTarget.addEventListener("config",newConfig=>{config=newConfig;unsubscribe();const serviceResult=service$$1(config);if(serviceResult){if(serviceResult.then){const thenable=serviceResult;thenable.then(observable=>{if(observable){subscription=observable.subscribe(observer);}}).catch(err=>{if(observer.error){observer.error(err);}});}else{const observable=serviceResult;subscription=observable.subscribe(observer);}}});};}/**
     * Gets a standard error message for imperative invocation not being supported.
     * @param id The adapter id.
     * @returns Error object to be thrown.
     */function generateError(id){return new Error(`Imperative use is not supported. Use @wire(${id}).`);}/**
     * Checks for the Map containing refreshAdaptor Promise and invokes the promise if exist
     * @param wiredTargetValue {data:..,error:..} Wired value returned by adapter
     * @returns Promise which either resolves in the Promise to fetch the refresh Value or error if adapter does not support refresh
     */function refreshWireAdapter(wiredTargetValue){wiredTargetValue=lwc.unwrap(wiredTargetValue);const refreshPromise=wiredTargetValueToConfigMap.get(wiredTargetValue);if(refreshPromise){return refreshPromise();}return Promise.reject(new Error("Refresh failed because resolved configuration is not available."));}/**
     * Validates an @wire config is well-formed.
     * @param id The adapter id.
     * @param config The @wire config to validate.
     * @param required The keys the config must contain.
     * @param supported The keys the config may contain.
     * @param unsupported The keys the config must not contain.
     * @param oneof The keys the config must contain at least one of.
     * @throws An error if config doesn't satisfy the provided key sets.
     */function validateConfig(id,config,required,supported,unsupported,oneof){if(required.some(req=>!(req in config))){throw new Error(`@wire(${id}) configuration must specify ${required.join(", ")}`);}if(oneof&&!oneof.some(req=>req in config)){throw new Error(`@wire(${id}) configuration must specify one of ${oneof.join(", ")}`);}if(unsupported&&unsupported.some(req=>req in config)){throw new Error(`@wire(${id}) configuration must not specify ${unsupported.join(", ")}`);}if(Object.keys(config).some(key=>!supported.includes(key))){throw new Error(`@wire(${id}) configuration supports only ${supported.join(", ")}`);}}/**
     * Wire adapter id: getObjectInfo.
     * @throws Always throws an error when invoked. Imperative invocation is not supported.
     */function getObjectInfo(){throw generateError("getObjectInfo");}/**
     * Generates the wire adapter for Object Info.
     */class ObjectInfoWireAdapterGenerator{/**
         * Constructor.
         * @param objectInfoService Reference to the ObjectInfoService instance.
         */constructor(objectInfoService){this._objectInfoService=objectInfoService;}/**
         * Generates the wire adapter for @wire getObjectInfo.
         * @returns See description
         */generateGetObjectInfoWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetObjectInfo.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Services getObjectInfo @wire.
         * @param config contains objectApiName
         * @returns Observable stream that emits an object info.
         */serviceGetObjectInfo(config){if(!config){return undefined;}{const required=["objectApiName"];const supported=["objectApiName"];validateConfig("getObjectInfo",config,required,supported);}if(!config.objectApiName){return undefined;}return this._objectInfoService.getObjectInfo(config.objectApiName);}}/**
     * CacheAccessorWrapper that can track records and object-infos to use to inform recordLibrary where appropriate during commitPuts().
     */class RecordCacheAccessorWrapper{/**
         * Constructor
         * @param cacheAccessor Cache Accessor of LDS Cache.
         * @param adsBridge Ads Bridge ref to inform ADS about records.
         */constructor(cacheAccessor,adsBridge){/**
             * Map of records to inform the ADS cache.
             */this._recordsToInform=new Map();/**
             * Map of object-infos to inform the ADS.
             */this._objectInfos=new Map();this._cacheAccessor=cacheAccessor;this._adsBridge=adsBridge;}/**
         * current time from CacheAccessor.
         * @returns current time from CacheAccessor.
         */get nowTime(){return this._cacheAccessor.nowTime;}/**
         * Returns the Thenable containing ValueWrapper from the cache.
         * @param cacheKey Cachekey for the object in the cache.
         * @returns Thenable of thhe ValueWrapper from the cache.
         */get(cacheKey){return this._cacheAccessor.get(cacheKey);}/**
         * Returns the ValueWrapper for the cachekey.
         * @param cacheKey Cachekey for the object in the cache.
         * @returns ValueWrapper from the cache.
         */getCommitted(cacheKey){return this._cacheAccessor.getCommitted(cacheKey);}/**
         * Stage put the values using cacheAccessor.
         * @param dependentCacheKeysArray Dependent keys for which this value to be cached is dependent on.
         * @param cacheKey Cachekey for the object in the cache.
         * @param valueToCache Value to cache in the LDS.
         * @param valueToEmit Value to emit.
         * @param optionalValueWrapperParams Extra Params need to normalize this value in the cache.
         */stagePut(dependentCacheKeysArray,cacheKey,valueToCache,valueToEmit,optionalValueWrapperParams){const valueType=cacheKey.getValueType();if(valueType===OBJECT_INFO_VALUE_TYPE&&valueToEmit!==null){this._objectInfos.set(valueToEmit.apiName,valueToEmit);}else if(valueType===RECORD_VALUE_TYPE){// Note, when a record is staged more than once (multiple nested instances of the same record) the latest record
    // should be the most merged and should be the most complete, and overwriting it in the map lets that one win.
    this._recordsToInform.set(valueToEmit.id,valueToEmit);}return this._cacheAccessor.stagePut(dependentCacheKeysArray,cacheKey,valueToCache,valueToEmit,optionalValueWrapperParams);}/**
         * Invokes CacheAccessor's stagePutUpdateLastFetchTime.
         * @param cacheKey Cachekey for the object in the cache.
         */stagePutUpdateLastFetchTime(cacheKey){return this._cacheAccessor.stagePutUpdateLastFetchTime(cacheKey);}/**
         * Invokes CacheAccessor's stageDependencies with the values passed, take a look at CacheAccessor for more information.
         * @param dependentCacheKeysArray Dependent keys for which this value to be cached is dependent on.
         * @param cacheKey Cachekey for the object in the cache.
         */stageDependencies(dependentCacheKeysArray,cacheKey){return this._cacheAccessor.stageDependencies(dependentCacheKeysArray,cacheKey);}/**
         * Clear the dependencies for the cacheKey passed.
         * @param cacheKey Cachekey for the object in the cache.
         */stageClearDependencies(cacheKey){return this._cacheAccessor.stageClearDependencies(cacheKey);}/**
         * Invokes the commitPuts of CacheAccessor, inform the ADS using adsbridge and returns the affected Keys.
         */commitPuts(){const affectedKeys=this._cacheAccessor.commitPuts();const recordsToInformArray=Array.from(this._recordsToInform.values());for(let len=recordsToInformArray.length,n=0;n<len;n++){const record=recordsToInformArray[n];const objectInfoIfAvailable=this._objectInfos.get(record.apiName);this._adsBridge.informRecordLib(record,objectInfoIfAvailable);// If we have an object info then great, otherwise, let this retrieve it if necessary.
    }return affectedKeys;}/**
         * Invokes the CacheAccessor's stageEmit.
         * @param cacheKey Cachekey for the object in the cache.
         * @param valueToEmit ValueWrapper of the value to be emitted.
         */stageEmit(cacheKey,valueToEmit){return this._cacheAccessor.stageEmit(cacheKey,valueToEmit);}/**
         * Invokes the CacheAccessor's isEmitStaged and returns true if the value for the cacheKey is staged for emit.
         * @param cacheKey Cachekey for the object in the cache.
         */isEmitStaged(cacheKey){return this._cacheAccessor.isEmitStaged(cacheKey);}/**
         *  method that returns the number of staged emits from staging puts and emits.
         *  @returns the number of staged emits from staging puts and emits.
         */get stagedEmitsCount(){return this._cacheAccessor.stagedEmitsCount;}/**
         * Gets the observables for the CacheKey if they exist.
         * @param cacheKey Cachekey for the object in the cache.
         */getObservables(cacheKey){return this._cacheAccessor.getObservables(cacheKey);}/**
         * Gets the observables for the CacheKey, creating them if necessary.
         * @param cacheKey The cache key for the Observable.
         * @returns The observables for the cache key.
         */getOrCreateObservables(cacheKey){return this._cacheAccessor.getOrCreateObservables(cacheKey,RECORD_TTL);}/**
         * Checks if there is an observable for the given cache key.
         * @param cacheKey The key for the Observable.
         * @returns True if the observable for the record exists, otherwise false.
         */hasObservable(cacheKey){return this._cacheAccessor.hasObservable(cacheKey);}/**
         * Makes a new immutable ValueWrapper with a lastFetchTime consistent with the rest of the CacheAccessor transaction. Optionally an
         * eTag may be provided (if available), as can an arbitrary Object containing information the ValueProvider may desire during a
         * future cache transaction.
         * @param valueToCache The value to be cached required (must not be undefined). This should not be an already wrapped
         *      value (instanceof ValueWrapper).
         * @param eTagOverride The eTag to be set on the ValueWrapper.
         * @param extraInfoObject An arbitrary object that ValueProviders may use to store additional information about the value being
         *      cached.
         * @returns The provided params wrapped in an immutable ValueWrapper.
         */newValueWrapper(valueToCache,eTagOverride,extraInfoObject){return this._cacheAccessor.newValueWrapper(valueToCache,eTagOverride,extraInfoObject);}}const SYSTEM_MODSTAMP="SystemModstamp";const DISPLAY_VALUE="displayValue";/**
     * Collection of utility functions related to the record service.
     */class RecordServiceUtils{constructor(){this._knownViewEntityApiNamesSet=new UsefulSet(["AcceptedEventRelation","AccountPartner","AccountRecordUserAccess","AccountUserTerritory2View","ActivityHistory","AggregateResult","AllOrganization","AllOrganizationValue","AllPackageVersionLm","AllUsersBasic","ApexPackage","ApexPackageIdentifier","AssignmentRule","AttachedContentDocument","AttachedContentNote","AutoResponseRule","CaseStatus","CombinedAttachment","CombinedNote","ContentFolderItem","ContentHubRepository","ContentNote","ContractStatus","CrossOrgLimitUsageHistory","CrossOrgSite","CustomObjectFeed","DeclinedEventRelation","EscalationRule","EventAttendee","EventWhoRelation","FolderedContentDocument","FTestFieldMapping","FTestUnion","FtestViewInheriting","FtestViewNonInheriting","GenericRecordUserAccess","GlobalOrganization","InstalledSubscriberPackage","KnowledgeKeywordSearchHistory","KnowledgeSearchEventHistory","KnowledgeViewEventHistory","KnowledgeVoteEventHistory","LeadStatus","LookedUpFromActivity","MetadataPackage","MetadataPackageVersion","NewsFeed","NoteAndAttachment","OpenActivity","OpportunityPartner","OpportunityStage","OrganizationProperty","OwnedContentDocument","PackagePushError","PackagePushJob","PackagePushRequest","PackageSubscriber","PartnerRole","ProcessInstanceHistory","Project","PublicSolution","QueueMember","RecentlyViewed","RecordVisibility","ServiceAppointmentStatus","SolutionStatus","SubscriberPackage","SubscriberPackageVersion","TaskPriority","TaskStatus","TaskWhoRelation","UndecidedEventRelation","UserListPrefs","UserProfile","UserProfileFeed","UserRecordAccess","WorkOrderLineItemStatus","WorkOrderStatus"]);this._knownUIAPISupportedEntityApiNamesSet=new UsefulSet(["Account","AccountTeamMember","Asset","AssetRelationship","AssignedResource","AttachedContentNote","BusinessAccount","Campaign","CampaignMember","﻿CareBarrier","﻿CareBarrierType","Case","Contact","﻿ContactRequest","ContentDocument","ContentNote","ContentVersion","ContentWorkspace","Contract","ContractContactRole","ContractLineItem","Custom Object","Entitlement","EnvironmentHubMember","Lead","LicensingRequest","MaintenanceAsset","MaintenancePlan","MarketingAction","MarketingResource","Note","OperatingHours","Opportunity","OpportunityLineItem","OpportunityTeamMember","Order","OrderItem","PersonAccount","Pricebook2","PricebookEntry","Product2","RecordType","Quote","QuoteDocument","QuoteLineItem","ResourceAbsence","ResourcePreference","ServiceAppointment","ServiceContract","ServiceCrew","ServiceCrewMember","ServiceResource","ServiceResourceCapacity","ServiceResourceSkill","ServiceTerritory","ServiceTerritoryLocation","ServiceTerritoryMember","Shipment","SkillRequirement","SocialPost","Tenant","TimeSheet","TimeSheetEntry","TimeSlot","UsageEntitlement","UsageEntitlementPeriod","User","WorkOrder","WorkOrderLineItem","WorkType"]);}/**
         * Tells you if an objectApiName is that of a known view entity. Note: LDS does not currently support view entities, so this
         * method can be used to make sure they don't end up in the cache. If they are cached without proper support they can "stomp"
         * other records of a primary entity because they often share IDs.
         * @param objectApiName the object API name from a record.
         * @return True if the provided objectApiName is that of a known view entity.
         */isKnownViewEntity(objectApiName){return this._knownViewEntityApiNamesSet.has(objectApiName);}/**
         * Tells you if an objectApiName is supported by UI API or not.
         * Note: LDS does not currently support all the entities, the list is limited to UI API supported entities
         * @param objectApiName the object API name from a record.
         * @return True if the provided objectApiName is supported in UI API.
         */isSupportedEntity(objectApiName){return objectApiName.endsWith("__c")||this._knownUIAPISupportedEntityApiNamesSet.has(objectApiName);}/**
         * Used to check if SystemModstamps are present and different for the given records.
         * @param firstRecord The first record.
         * @param secondRecord The second record.
         * @returns false if SystemModstamp values exist in both records and are same.
         *          true if SystemModstamp values exist in both records and are different OR one or both record's
         *          systemModstamp do not have a value.
         */systemModstampsAreDifferent(firstRecord,secondRecord){// treat systemModstamp being null/undefined as being present and different and thereby return true
    // entities like ContentNote(and may be a few more entities) do not have a systemModstamp and thereby the value will be null
    if((firstRecord.systemModstamp===null||firstRecord.systemModstamp===undefined)&&(secondRecord.systemModstamp===null||secondRecord.systemModstamp===undefined)||firstRecord.systemModstamp!==secondRecord.systemModstamp){return true;}{// if we are here, it means the systemModstamps are equal. assert as a precaution
    assert$1(firstRecord.systemModstamp===secondRecord.systemModstamp,`The 2 systemModstamps are not equal. firstRecordSystemModstamp: ${firstRecord.systemModstamp} and secondRecordSystemModstamp: ${secondRecord.systemModstamp}`);}return false;}/**
         * Recursively get spanning records within record.
         * @param record The record from which we want to retrieve spanning records.
         * @param records Set of records passed from recursive call
         * @returns Set containing all spanning record Ids.
         */getSpanningRecords(record,records){const that=this;function checkSpanning(fieldValue){// this is going to check if the provided value is a spanning field
    // we don't want to count polymorphic Owner as a spanning field so it never gets replaced by wrong user record
    return that.isRecordRepresentation(fieldValue)&&fieldValue.apiName!=="Name";}if(!records){records=new Set();}if(checkSpanning(record)){const recordFields=record.fields;const recordFieldNamesArray=Object.keys(recordFields);for(let len=recordFieldNamesArray.length,n=0;n<len;n++){// we should add assert here to make sure that every field has a value
    const fieldValue=recordFields[recordFieldNamesArray[n]].value;if(fieldValue&&checkSpanning(fieldValue)){records.add(fieldValue);this.getSpanningRecords(fieldValue,records);}}}return records;}/**
         * Recursively adds field expressions to the provided set. Field expressions should be in the form of
         * <object-API-name>.<relation-name>*.<field-name>, e.g. "Account.Parent.Name".
         * @param fieldExpressionPrefix Any object API name and spanning field prefix for this record's fields. It should at least be an object API name at the root record level.
         * @param record The relevant record.
         * @param fieldNamesSet The set being used to gather all field names. This is an in/out parameter all fields
         *        will be added to this set.
         */recursivelyGatherFieldNames(fieldExpressionPrefix,record,fieldNamesSet){const recordFields=record.fields;const fieldNamesArray=Object.keys(recordFields);for(let len=fieldNamesArray.length,n=0;n<len;n++){const fieldName=fieldNamesArray[n];const fieldValue=recordFields[fieldNamesArray[n]].value;const fieldExpression=`${fieldExpressionPrefix}.${fieldName}`;if(this.isRecordRepresentation(fieldValue)){this.recursivelyGatherFieldNames(fieldExpression,fieldValue,fieldNamesSet);}else{fieldNamesSet.add(fieldExpression);}}}/**
         * Checks if the value passed is of shape of RecordRepresentation
         * @param value
         * @returns true if the value passed is of uiapi.RecordRepresentation shape
         */isRecordRepresentation(value){return value&&value.id!==undefined&&value.fields!==undefined&&value.apiName!==undefined&&value.systemModstamp!==undefined;}/**
         * Checks that for all field values in sourceRecord is same as targetRecord except for SystemModstamp and spanned record.
         * @param sourceRecord record to iterate over all fields and check value against target
         * @param targetRecord targetRecord
         * @return true if record is same (as explained in description)
         */areFieldsEqualForRecords(sourceRecord,targetRecord){return Object.keys(sourceRecord).every(prop=>{if(prop!==SYSTEM_MODSTAMP&&prop!==DISPLAY_VALUE&&!this.isTypeOfLdsRecord(sourceRecord[prop])&&targetRecord[prop]){if(this.isRecordRepresentation(sourceRecord[prop])&&this.isRecordRepresentation(targetRecord[prop])){return this.areFieldsEqualForRecords(sourceRecord[prop],targetRecord[prop]);}return sourceRecord[prop]===targetRecord[prop];}return true;});}/**
         * Checks that passed object is record or spanned record (in LDS spanned record has marker(true) with id for actual record entry).
         * @param obj Record(normalized or de/normalized object
         * @return true if object is record or spanned record to its parent
         */isTypeOfLdsRecord(obj){return this.isRecordRepresentation(obj)||cacheValueMarkerUtils.isRecordMarker(obj);}/**
         * Merges two record markers, taking the depth of the shallower marker.
         * Note: this can't be in record-marker-utils, causes a loop.
         * @param sourceMarker The source marker which may have different values.
         * @param targetMarker The marker to change if there are different values in the source marker.
         * @returns True if any changes were made to the target marker, otherwise false.
         */mergeRecordMarkers(sourceMarker,targetMarker){let changesMade=false;if(targetMarker.id!==sourceMarker.id){targetMarker.id=sourceMarker.id;changesMade=true;}if(targetMarker.recordTypeId!==sourceMarker.recordTypeId){targetMarker.recordTypeId=sourceMarker.recordTypeId;changesMade=true;}if(targetMarker.depth!==sourceMarker.depth){targetMarker.depth=Math.min(sourceMarker.depth,targetMarker.depth);changesMade=true;}const sourceFields=sourceMarker.fields;const targetFields=targetMarker.fields;let fieldsChanged=false;if(changesMade&&targetFields.length!==sourceFields.length){targetMarker.fields=sourceFields;fieldsChanged=true;}else{for(let c=0;c<sourceFields.length;++c){const sourceField=sourceFields[c];if(!targetFields.includes(sourceField)){targetFields.push(sourceField);fieldsChanged=true;}}}if(fieldsChanged){targetFields.sort();}changesMade=changesMade||fieldsChanged;return changesMade;}/**
         * Applies any changes in the sourceRecord to the targetRecord if it would result in a change to the targetRecord. This will
         * not copy over new eTag properties (ignores them) and if any other changes are made, it will clear the eTag property in the
         * targetRecord because it has been rendered useless.
         * @param sourceRecord A record that may have different values.
         * @param targetRecord The record to change if there are different values in the source record.
         * @returns true if any changes were made to the targetRecord.
         */deepRecordCopy(sourceRecord,targetRecord){let changesMade=false;const sourceRecordKeysArray=Object.keys(sourceRecord);for(let len=sourceRecordKeysArray.length,n=0;n<len;n++){const recordProp=sourceRecordKeysArray[n];const targetRecordPropValue=targetRecord[recordProp];// TODO: Remove this hack when W-5775123 is done
    if(recordProp==="recordTypeInfo"){if(!sourceRecord[recordProp]&&targetRecord[recordProp]){continue;}else if(sourceRecord[recordProp]&&!targetRecord[recordProp]){targetRecord[recordProp]=sourceRecord[recordProp];changesMade=true;}}if(targetRecordPropValue&&typeUtils.isPlainObject(targetRecordPropValue)){if(cacheValueMarkerUtils.isRecordMarker(targetRecordPropValue)&&cacheValueMarkerUtils.isRecordMarker(sourceRecord[recordProp])){const markerChangesMade=this.mergeRecordMarkers(sourceRecord[recordProp],targetRecordPropValue);changesMade=changesMade||markerChangesMade;}else if(cacheValueMarkerUtils.isRecordMarker(targetRecordPropValue)&&!cacheValueMarkerUtils.isRecordMarker(sourceRecord[recordProp])){changesMade=true;targetRecord[recordProp]=sourceRecord[recordProp];}else{const deepChangesMade=this.deepRecordCopy(sourceRecord[recordProp],targetRecord[recordProp]);changesMade=changesMade||deepChangesMade;}}else if(recordProp!=="eTag"&&targetRecord[recordProp]!==sourceRecord[recordProp]){changesMade=true;targetRecord[recordProp]=sourceRecord[recordProp];}}if(changesMade&&this.isRecordRepresentation(targetRecord)){// If a record has been merged we can no longer use its ETag -- it will no longer be correct.
    delete targetRecord.eTag;}return changesMade;}/**
         * Returns the record type id contained in the given record. If the record doesn't have that info, it will
         * return the MASTER_RECORD_TYPE_ID.
         * @param record The record from which to extract the record type id.
         * @returns recordTypeId of the record.
         */getRecordTypeIdFromRecord(record){return record.recordTypeInfo&&record.recordTypeInfo.recordTypeId||MASTER_RECORD_TYPE_ID;}/**
         * Returns a new object that has a list of fields that has been filtered by edited fields. Only contains fields that have been
         * edited from their original values (excluding Id which is always copied over.)
         * @param recordInput The uiapi.RecordInput object to filter.
         * @param originalRecord The Record object that contains the original field values.
         * @returns uiapi.RecordInput, see the description
         */createRecordInputFilteredByEditedFields(recordInput,originalRecord){const filteredRecordInput=this.getRecordInput();// Always copy over any existing id.
    if(originalRecord.id){filteredRecordInput.fields.Id=originalRecord.id;}const recordInputFields=recordInput.fields;const originalRecordFields=originalRecord.fields;const recordInputFieldPropertyNames=Object.getOwnPropertyNames(recordInputFields);for(let len=recordInputFieldPropertyNames.length,n=0;n<len;n++){const fieldName=recordInputFieldPropertyNames[n];let originalRecordFieldsEntry;if(originalRecordFields){originalRecordFieldsEntry=originalRecordFields[fieldName];}if(!originalRecordFieldsEntry||originalRecordFields&&recordInputFields[fieldName]!==originalRecordFieldsEntry.value){filteredRecordInput.fields[fieldName]=recordInputFields[fieldName];}}return filteredRecordInput;}/**
         * Returns an object with its data populated from the given record. All fields with values that aren't nested records will be assigned.
         * This object can be used to create a record.
         * @param record The record that contains the source data.
         * @param objectInfo The ObjectInfo corresponding to the apiName on the record. If provided, only fields that are updatable=true
         *        (excluding Id) will be assigned to the object return value.
         * @returns uiapi.RecordInput See description.
         */generateRecordInputForCreate(record,objectInfo){const recordInput=this._generateRecordInput(record,true,objectInfo);recordInput.apiName=record.apiName;// fields.Id is not required for CREATE which might have been copied over, so delete fields.Id
    delete recordInput.fields.Id;return recordInput;}/**
         * Returns an object with its data populated from the given record. All fields with values that aren't nested records will be assigned.
         * This object can be used to update a record.
         * @param record The record that contains the source data.
         * @param objectInfo The ObjectInfo corresponding to the apiName on the record.
         *        If provided, only fields that are updatable=true (excluding Id) will be assigned to the object return value.
         * @returns uiapi.RecordInput See description.
         */generateRecordInputForUpdate(record,objectInfo){const recordInput=this._generateRecordInput(record,false,objectInfo);if(!record.id){throw new Error("record must have id for update");}// Always copy over any existing id.
    recordInput.fields.Id=record.id;return recordInput;}/**
         * Gets the cache key for the given record.
         * @param record The record for which to get the cache key.
         * @returns The CacheKey for the record.
         */getRecordCacheKey(record){return new RecordCacheKeyBuilder().setRecordId(record.id).build();}/**
         * Creates and returns a new filtered record from the given record that only contains the fields specified by allowedFields. Deep clone for now.
         * Will change to shallow copy in future.
         * @param record The record from which to create the filtered record.
         * @param allowedFields An object map keyed by the qualified field names to include in the filtered record.
         * @returns See description.
         */createFilteredRecordFromRecord(record,allowedFields){const splitField=/^([\w]+)\.(.*)$/;// W-4126359: Proxy and Array.includes are not supported in aura compat mode.
    const filterRecord=(scopedRecord,scopedAllowedFields)=>{const scopedRecordFieldsArray=Object.keys(scopedRecord.fields);for(let len=scopedRecordFieldsArray.length,n=0;n<len;n++){const fieldName=scopedRecordFieldsArray[n];// spanned record case
    if(this.isRecordRepresentation(scopedRecord.fields[fieldName].value)){const nextAllowedList=scopedAllowedFields.filter(field=>{return field.substring(0,fieldName.length)===fieldName&&splitField.test(field);}).map(field=>{const execVal=splitField.exec(field);if(execVal&&execVal.length>2){return execVal[2];}return "";});const filteredSpannedRecord=filterRecord(scopedRecord.fields[fieldName].value,nextAllowedList.filter(Boolean));if(Object.keys(filteredSpannedRecord.fields).length>0){// only include spanned record if we have access to at least one of its fields.
    scopedRecord.fields[fieldName].value=filteredSpannedRecord;}else{delete scopedRecord.fields[fieldName];}}else if(scopedRecord.fields[fieldName].value===null&&scopedAllowedFields.reduce((accumulator,currentValue)=>{return accumulator||currentValue.split(".")[0]===fieldName;// weird formatting requirement from eslint
    },false));else if(scopedAllowedFields.indexOf(fieldName)===-1){// single field value case
    delete scopedRecord.fields[fieldName];}}// Remove the etag field from the root of the filtered record. Etags don't apply to filtered records because we are changing the number of fields on the record which
    // invalidates the etag. If we didn't remove this field, the equivalence check on the final distinctUntilChanged operator on the filtered observable stream would think
    // the record has changed because the etag has changed, even if all the other data remained the same.
    delete scopedRecord.eTag;return scopedRecord;};const currentRecord=clone(record,this.getRecordCacheKey(record));return filterRecord(currentRecord,allowedFields);}/**
         * Returns a wrapper for a CacheAccessor that can track records and object infos to use to inform recordLibrary where appropriate during
         * commitPuts().
         * TODO: W-5043986 - Formalize this as a real type.
         * @param cacheAccessor The cache accessor to wrap.
         * @returns A wrapper for a CacheAccessor that can track records and object infos to use to inform recordLibrary where appropriate during
         *                   commitPuts().
         */wrapCacheAccessor(cacheAccessor,adsBridgeObj){return new RecordCacheAccessorWrapper(cacheAccessor,adsBridgeObj);}/**
         * Returns an object with its data populated from the given record. All fields with values that aren't nested records will be assigned.
         * @param record The record that contains the source data.
         * @param create used to decide whether to use updateable or createable flag in objectInfo.
         * @param objectInfo The ObjectInfo corresponding to the apiName on the record.
         *        If provided, only fields that are updatable=true (excluding Id) will be assigned to the object return value.
         * @returns uiapi.RecordInput
         */_generateRecordInput(record,create,objectInfo){const recordInput=this.getRecordInput();const recordFields=record.fields;let objectInfoFields;if(objectInfo){objectInfoFields=objectInfo.fields;}// Copy fields. If they provided an objectInfo, only copy over updateable fields.
    const recordFieldPropertyNames=Object.getOwnPropertyNames(recordFields);for(let len=recordFieldPropertyNames.length,n=0;n<len;n++){const fieldName=recordFieldPropertyNames[n];const recordFieldsFieldNameEntry=recordFields[fieldName].value;if(objectInfoFields){const objectInfoFieldsFieldNameValue=objectInfoFields[fieldName];if(objectInfoFieldsFieldNameValue){if(create){if(objectInfoFieldsFieldNameValue.createable===true){recordInput.fields[fieldName]=recordFieldsFieldNameEntry;}}else if(objectInfoFieldsFieldNameValue.updateable===true){recordInput.fields[fieldName]=recordFieldsFieldNameEntry;}}}else{recordInput.fields[fieldName]=recordFieldsFieldNameEntry;}}return recordInput;}/**
         * Gets a new Record Input.
         */getRecordInput(){const recordInput={apiName:undefined,fields:{}};return recordInput;}/**
         * Gets a field's value from a record.
         * @param record The record.
         * @param field The qualified API name of the field to return.
         * @returns The field's value (which may be a record in the case of spanning fields), or undefined if the field isn't found.
         */getFieldValue(record,field){const unqualifiedField=splitQualifiedFieldApiName(getFieldApiName(field))[1];const fields=unqualifiedField.split(".");let r=record;while(fields.length>0&&r&&r.fields){const f=fields.shift();const fvr=r.fields[f];if(fvr===undefined){return undefined;}else{r=fvr.value;}}return r;}/**
         * Gets a field's display value from a record.
         * @param record The record.
         * @param field The qualified API name of the field to return.
         * @returns The field's display value, or undefined if the field isn't found.
         */getFieldDisplayValue(record,field){const unqualifiedField=splitQualifiedFieldApiName(getFieldApiName(field))[1];const fields=unqualifiedField.split(".");let r=record;while(r&&r.fields){const f=fields.shift();const fvr=r.fields[f];if(fvr===undefined){return undefined;}else if(fields.length>0){r=fvr.value;}else{return fvr.displayValue;}}return r;}}/**
     * RecordServiceUtils The singleton instance of the class.
     */const recordServiceUtils=new RecordServiceUtils();/**
     * Cache value marker for record.
     */class RecordCacheValueMarker extends CacheValueMarker{constructor(timestamp,id,depth,fields,apiName,lastModifiedById,lastModifiedDate,systemModstamp,eTag,recordTypeId){super(timestamp);this.eTag=eTag;this.id=id;this.recordTypeId=recordTypeId;this.depth=depth;this.fields=fields;this.apiName=apiName;this.lastModifiedById=lastModifiedById;this.lastModifiedDate=lastModifiedDate;this.systemModstamp=systemModstamp;}}/**
     * Constructs a RecordCacheValueMarker.
     */class RecordCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the recordId for the marker.
         * @param recordId The recordId for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setId(recordId){this._id=recordId;return this;}/**
         * Sets the eTag for the marker.
         * @param eTag The eTag for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Sets the recordTypeId for the marker.
         * @param value The recordTypeId for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(value){this._recordTypeId=value;return this;}/**
         * Sets the Depth for the marker.
         * @param value The depth for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setDepth(value){this._depth=value;return this;}/**
         * Sets the Fields for the marker.
         * @param value The fields for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setFields(value){this._fields=value;return this;}/**
         * Sets the ApiName for the marker.
         * @param value The apiName for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setApiName(value){this._apiName=value;return this;}/**
         * Sets the lastModifiedById for the marker.
         * @param value The lastModifiedById for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setLastModifiedById(value){this._lastModifiedById=value;return this;}/**
         * Sets the lastModifiedDate for the marker.
         * @param value The lastModifiedDate for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setLastModifiedDate(value){this._lastModifiedDate=value;return this;}/**
         * Sets the systemModstamp for the marker.
         * @param value The systemModstamp for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setSystemModstamp(value){this._systemModstamp=value;return this;}/**
         * Builds the RecordCacheValueMarker with the assigned parameters.
         * @returns A new RecordCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._id,"A non-empty recordId must be set.");}return new RecordCacheValueMarker(this._timestamp,this._id,this._depth,this._fields,this._apiName,this._lastModifiedById,this._lastModifiedDate,this._systemModstamp,this._eTag,this._recordTypeId);}}/**
     * Utility functions for dealing with record markers.
     */class RecordMarkerUtils{/**
         * Creates and returns a marker for the given record that should be used to replace records and nested records during normalization.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param record The record to use to create the marker.
         * @param depth The depth at which this record exists in a nested record structure. The root record would be depth 0 while
         *        a first level spanning field would be depth 1. Depths greater than 5 are not supported or necessary because SOQL doesn't
         *        support more than 5 levels of record spanning.
         * @param objectInfo Optional. The objectInfo for the record. If specified, this includes the fields from the relationships
         *        this record can have.
         * @returns a marker for the given record that should be used to replace records and nested records during normalization
         */toRecordMarker(cacheAccessor,record,depth,objectInfo){// TODO: Markers for childRelationships
    {assert$1(record.id,`The record had no recordId.`);assert$1(depth>=0&&depth<=5,`Invalid depth: ${depth}`);}const id=record.id;const recordTypeId=record.recordTypeInfo&&record.recordTypeInfo.recordTypeId;const recordFields=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(record.apiName,record,recordFields);const recordCacheValueMarkerBuilder=new RecordCacheValueMarkerBuilder();recordCacheValueMarkerBuilder.setTimestamp(cacheAccessor.nowTime);recordCacheValueMarkerBuilder.setId(id);recordCacheValueMarkerBuilder.setRecordTypeId(recordTypeId);recordCacheValueMarkerBuilder.setDepth(depth);if(objectInfo){// Add fields from the lookup relationship record based on objectInfo metadata.
    const fieldsWithRelations=Array.from(Object.values(objectInfo.fields)).filter(field=>field.relationshipName);fieldsWithRelations.forEach(field=>{field.referenceToInfos.forEach(referenceToInfo=>{// Include the Id field. Ex: Opportunity.Account.Id, Opportunity.relation1__r.Id
    recordFields.add(record.apiName+"."+field.relationshipName+".Id");// Include any other fields. Ex: Opportunity.Account.Name, Opportunity.relation1__r.Name
    referenceToInfo.nameFields.forEach(nameField=>recordFields.add(record.apiName+"."+field.relationshipName+"."+nameField));});});}recordCacheValueMarkerBuilder.setFields(collectionToArray(recordFields).sort());recordCacheValueMarkerBuilder.setApiName(record.apiName);recordCacheValueMarkerBuilder.setLastModifiedById(record.lastModifiedById);recordCacheValueMarkerBuilder.setLastModifiedDate(record.lastModifiedDate);recordCacheValueMarkerBuilder.setSystemModstamp(record.systemModstamp);return recordCacheValueMarkerBuilder.build();}/**
         * Returns an array of unqualified field names taken off the given recordMarker.
         * @param recordMarker The recordMarker instance to extract unqualified field names off of.
         * @returns See description.
         */getUnqualifiedFieldNamesFromRecordMarker(recordMarker){const apiNameReg=new RegExp(`^${recordMarker.apiName}\\.`);const unqualifiedFieldNames=[];const recordMarkerFields=recordMarker.fields;if(recordMarkerFields){for(let i=0,length=recordMarkerFields.length;i<length;++i){const qualifiedFieldName=recordMarkerFields[i];const unqualifiedFieldName=qualifiedFieldName.replace(apiNameReg,"");unqualifiedFieldNames.push(unqualifiedFieldName);}}return unqualifiedFieldNames;}}/**
     * RecordMarkerUtils The singleton instance of the class.
     */const recordMarkerUtils=new RecordMarkerUtils();/**
     * Constructs a cache key for the RECORD_VALUE_TYPE as a filtered record. Keys are constructed from:
     * recordId
     * requiredFields
     * optionalFields
     */class FilteredRecordKeyBuilder extends RecordCacheKeyBuilder{/**
         * Sets the _requiredFields for the cache key.
         * @param requiredFields The list of optional fields.
         * @returns The current object. Useful for chaining method calls.
         */setRequiredFields(requiredFields){this._requiredFields=collectionToArray(requiredFields);return this;}/**
         * Sets the _optionalFields for the cache key.
         * @param optionalFields The list of optional fields.
         * @returns The current object. Useful for chaining method calls.
         */setOptionalFields(optionalFields){this._optionalFields=collectionToArray(optionalFields);return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the RECORD_VALUE_TYPE value type.
         */build(){{assert$1(this.recordId,"Non-empty recordId must be provided.");}const fields=this._requiredFields.sort().join(",");const optional=this._optionalFields.sort().join(",");return new CacheKey(this.getValueType(),`${this.recordId}${KEY_DELIM}${fields}${KEY_DELIM}${optional}`);}}class StagePutObject{constructor(dependentCacheKeysArray,sourceCachekey,objectToCache,objectToEmit,root,eTag){this.dependentCacheKeysArray=dependentCacheKeysArray;this.sourceCachekey=sourceCachekey;this.objectToCache=objectToCache;this.objectToEmit=objectToEmit;this.root=root;this.eTag=eTag;}}/**
     * Constructs a cache key for the Layout value type. Keys are constructed from:
     * objectApiName
     * recordTypeId
     * layoutType
     * mode
     *
     * Layout cache key is used as cache key for layout data provided by UI API.
     * So, LayoutCacheKeyBuilder doesn't support as many layout key params as recordlibrary currently uses,
     * because recordlibrary supports more layout types than UI API supports. Example: List, Related List layout.
     */class LayoutCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor
         */constructor(){super(LAYOUT_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name with which the layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName.toLowerCase();return this;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The record type id with which the layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this.recordTypeId=recordTypeId;return this;}/**
         * Sets the layoutType for the cache key.
         * @param layoutType The layout type with which the layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this.layoutType=layoutType.toLowerCase();return this;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setMode(mode){this.mode=mode.toLowerCase();return this;}/**
         * Builds the cache key.
         * @returns CacheKey A new cache key representing the Layout value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");assert$1(this.layoutType,"A non-empty layoutType must be provided.");assert$1(this.mode,"A non-empty mode must be provided.");assert$1(this.recordTypeId!==null&&this.recordTypeId!==undefined,"recordTypeId must be defined.");assert$1(this.recordTypeId.length===18,"Record Type Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this.objectApiName}${KEY_DELIM}${this.recordTypeId}${KEY_DELIM}${this.layoutType}${KEY_DELIM}${this.mode}`);}}/**
     * Provides functionality to read layout data from the cache. Can refresh the data from the server.
     */class LayoutService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[LAYOUT_VALUE_TYPE]);}getCacheValueTtl(){return LAYOUT_TTL;}/**
         * Retrieves a layout from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
         * @param objectApiName The object api name of the layout to retrieve.
         * @param layoutType The layout type of the layout to retrieve.
         * @param mode The mode of the layout to retrieve.
         * @param recordTypeId The record type id of the layout to retrieve.
         */getLayout(objectApiName,layoutType,mode,recordTypeId){recordTypeId=to18(recordTypeId);const cacheKey=new LayoutCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).setLayoutType(layoutType).setMode(mode).build();const valueProviderParameters={cacheKey,objectApiName,layoutType,mode,recordTypeId,forceProvide:false};const valueProvider=this._createLayoutValueProvider.call(this,valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Stage puts the given layout.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param layout The layout value to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,layout,cacheAccessor,additionalData){const layoutCacheKey=new LayoutCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).setLayoutType(layout.layoutType).setMode(layout.mode).build();return cacheAccessor.get(layoutCacheKey).then(existingValueWrapper=>{const eTag=layout.eTag;if(existingValueWrapper&&existingValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(layoutCacheKey);}// Strip out the eTag from the value. We don't want to emit eTags!
    layout=this.stripETagsFromValue(layout);return cacheAccessor.stagePut(dependentCacheKeys,layoutCacheKey,layout,layout,{eTag});});}/**
         * Strips all eTag properties from the given layout by directly deleting them.
         * @param layout The layout from which to strip the eTags.
         * @returns The given layout with its eTags stripped.
         */stripETagsFromValue(layout){delete layout.eTag;return layout;}/**
         * Creates a value provider to retrieve a Layout.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns ValueProvider The value provider to retrieve a Layout.
         */_createLayoutValueProvider(valueProviderParameters){const{cacheKey,objectApiName,layoutType,mode,recordTypeId,forceProvide}=valueProviderParameters;const valueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){return this._getFreshValue.call(this,cacheAccessor,cacheKey,objectApiName,layoutType,mode,recordTypeId);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+LAYOUT_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue.call(this,cacheAccessor,cacheKey,objectApiName,layoutType,mode,recordTypeId,existingValueWrapper.eTag);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value; get a fresh value.
    return this._getFreshValue.call(this,cacheAccessor,cacheKey,objectApiName,layoutType,mode,recordTypeId);});},valueProviderParameters);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the layout.
         * @param objectApiName The objectApiName of the layout.
         * @param layoutType The layoutType of the layout.
         * @param mode The mode of the layout.
         * @param recordTypeId The recordTypeId of the layout.
         * @param eTagToCheck eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns Thenable<ValueProviderResult> Returns a thenable representing the outcome of value provider
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,layoutType,mode,recordTypeId,eTagToCheck){let layoutThenable;const params={objectApiName,layoutType,mode,recordTypeId,clientOptions:undefined};if(eTagToCheck){params.clientOptions={eTagToCheck};}if(transportUtils.useAggregateUi){layoutThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getLayout",params,LAYOUT_TTL);}else{layoutThenable=executeAuraGlobalController("RecordUiController.getLayout",params);}return layoutThenable.then(transportResponse=>{// Cache miss refresh unchanged.
    if(transportResponse.status===304){return ThenableFactory.resolve(ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED);}// Cache miss.
    return ThenableFactory.resolve(undefined).then(()=>{cacheAccessor.stageClearDependencies(cacheKey);const freshLayout=transportResponse.body;return this.stagePutValue([],freshLayout,cacheAccessor,{objectApiName,recordTypeId});}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{// TODO: W-4421269 for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Cache value marker for layout.
     */class LayoutCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param objectApiName The objectApiName for the marker.
         * @param recordTypeId The recordTypeId for the marker.
         * @param layoutType The layoutType for the marker.
         * @param mode The mode for the marker.
         * @param eTag The eTag for the marker.
         */constructor(timestamp,objectApiName,recordTypeId,layoutType,mode,eTag){super(timestamp);this.objectApiName=objectApiName;this.recordTypeId=recordTypeId;this.layoutType=layoutType;this.mode=mode;this.eTag=eTag;}}/**
     * Constructs a LayoutCacheValueMarker.
     */class LayoutCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the eTag for the marker.
         * @param eTag
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * Sets the layoutType for the marker.
         * @param layoutType The layoutType.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this._layoutType=layoutType;return this;}/**
         * Sets the mode for the marker.
         * @param mode The mode.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode;return this;}/**
         * Builds the LayoutCacheValueMarker with the assigned parameters.
         * @returns A new LayoutCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._layoutType,"A non-empty layoutType must be set.");assert$1(this._mode,"A non-empty mode must be set.");}return new LayoutCacheValueMarker(this._timestamp,this._objectApiName,this._recordTypeId,this._layoutType,this._mode,this._eTag);}}/**
     * Returns an array of qualifiedFieldNames taken from the given layout.
     * @param layout The layout object from which to get the qualified field names.
     * @param objectInfo The object info object associated with the layout.
     * @throws An error if invalid layout or objectInfo is provided.
     * @returns See description.
     */function getQualifiedFieldApiNamesFromLayout(layout,objectInfo){if(!layout){throw new Error("layout must be defined");}if(!objectInfo){throw new Error("objectInfo must be defined");}const qualifiedFieldNames=[];for(let sectionsIndex=0,sectionsLength=layout.sections.length;sectionsIndex<sectionsLength;++sectionsIndex){const section=layout.sections[sectionsIndex];for(let rowsIndex=0,rowsLength=section.layoutRows.length;rowsIndex<rowsLength;++rowsIndex){const row=section.layoutRows[rowsIndex];for(let itemsIndex=0,itemsLength=row.layoutItems.length;itemsIndex<itemsLength;++itemsIndex){const item=row.layoutItems[itemsIndex];for(let componentsIndex=0,componentsLength=item.layoutComponents.length;componentsIndex<componentsLength;++componentsIndex){const component=item.layoutComponents[componentsIndex];if(component.apiName&&component.componentType==="Field"){if(isReferenceFieldNameWithRelationshipName(component.apiName,objectInfo)){const spanningFieldName=getSpanningFieldName(objectInfo,component.apiName);// By default, include "Id" and "Name" fields on spanning records that are on the layout.
    qualifiedFieldNames.push(`${objectInfo.apiName}.${spanningFieldName}.Id`);qualifiedFieldNames.push(`${objectInfo.apiName}.${spanningFieldName}.Name`);}qualifiedFieldNames.push(`${objectInfo.apiName}.${component.apiName}`);}}}}}return qualifiedFieldNames;}/**
     * Returns true if the field specified by the given fieldName is a reference field that also has
     * a relationship name, else false. Also returns false if the objectInfo has no data for that fieldName.
     * @param fieldName The fieldName of the field to check.
     * @param objectInfo The object info that contains the metadata for the field.
     * @returns See description.
     */function isReferenceFieldNameWithRelationshipName(fieldName,objectInfo){if(!objectInfo.fields[fieldName]){return false;}if(objectInfo.fields[fieldName].reference&&objectInfo.fields[fieldName].relationshipName){return true;}return false;}/**
     * Returns the spanning field name for the given referenceFieldName.
     * @param referenceFieldName The field name of the reference field from which to get the spanning field name.
     * @throws An error for unsupported reference field name.
     * @returns See description.
     */function getSpanningFieldName(objectInfo,referenceFieldName){if(objectInfo.fields[referenceFieldName]&&objectInfo.fields[referenceFieldName].relationshipName){return objectInfo.fields[referenceFieldName].relationshipName;}throw new Error(`Unsupported referenceFieldName: ${referenceFieldName}`);}/**
     * Provides functionality to read, create and update records in the cache. Can refresh records with data from the server.
     * We do not utilize caching or sending eTags to the server for this value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class RecordService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param adsBridge Reference to the AdsBridge instance.
         */constructor(ldsCache,adsBridge){super(ldsCache,[RECORD_VALUE_TYPE]);/**
             * Mapping of record id -> fields requested.
             */this._recordIdsToFieldsRequestedMap=new Map();/**
             * Mapping of record id -> fields requested by ADS. LDS is not currently interested in these but we will add these fields to fetch on CACHE_MISS or refresh.
             */this._recordIdsToFieldsToRefreshMap=new Map();/**
             * Mapping of record id -> readOnly observable.
             */this._recordIdsToReadOnlyObservablesMap=new Map();/**
             * Mapping of filtered observable cache key -> filtered observable.
             */this._filteredObservables=new Map();/**
             * Mapping of record -> spanning record subscription.
             */this._recordToSpanningRecordSubscriptionMap=new Map();/**
             * Mapping of object name -> is whitelisted.
             */this._objectNameToIsWhitelistedMap=new Map();/**
             * Mapping of record id -> number of current active refreshes. This is used to prevent filtered observables
             * from emitting old values while a refresh(s) is happening.
             */this._recordIdsToIsRefreshingMap=new Map();/**
             * Set of entities that have had server calls to UI API fail.
             */this._unsupportedEntitiesSet=new Set();/**
             * This map stores the mergedRecord object for all records where we detected a merge conflict. Though we detected a merge conflict,
             * we merge the existing record in cache with the fresh value and store it in this map.
             * We do this so that we do not have issues when ads gives records to lds and the denorm of record fails before we stageput due to extra fields in the marker.
             * See W-5302879 for more details.
             */this._mergeConflictRecordsMap=new Map();this._adsBridge=adsBridge;this._ldsCache.registerAffectedKeyHandler(RECORD_VALUE_TYPE,this._recordAffectedKeyHandler.bind(this));}getCacheValueTtl(){return RECORD_TTL;}/**
         * Gets a record.
         * @param recordId Id of the record to retrieve.
         * @param fields Qualified field API names to retrieve. If any are inaccessible then an error is emitted.
         * @param optionalFields Qualified field API names to retrieve. If any are inaccessible then they are silently omitted.
         * @returns An observable of the record.
         */getRecordWithFields(recordId,fields,optionalFields){return this.getRecordWithFieldsWithMetaConfig(recordId,fields,optionalFields);}/**
         * WARNING: PLEASE DO NOT USE THIS METHOD DIRECTLY FROM RECORD SERVICE, CONTACT LDS TEAM FOR MORE INFORMATION
         * Note: This method is used to refresh the record by skipping the cache, and must not be exported to force-lds-records
         * Gets a record with with additional retrieval configuration.
         * @param recordId Id of the record to retrieve.
         * @param fields Qualified field API names to retrieve. If any are inaccessible then an error is emitted.
         * @param optionalFields Qualified field API names to retrieve. If any are inaccessible then they are silently omitted.
         * @param metaConfig Retrieval configuration.
         *        forceProvide - if true then the cache is skipped
         *        successCallback - callback to be invoked after the refresh is complete
         *        errorCallback - callback to be invoked after the refresh fails
         * @returns An observable of the record.
         */getRecordWithFieldsWithMetaConfig(recordId,fields,optionalFields,metaConfig){const filteredObservable=this._privateGetRecordWithFields(recordId,fields,optionalFields,undefined,false,false,metaConfig);return filteredObservable;}/**
         * Gets a record by layoutType. The given layoutType specifies which fields will be returned on the record as well as any fields additionally specified
         * by fields and optionalFields.
         * @param recordId Id of the record to retrieve.
         * @param layoutTypes List of layoutTypes identifying the layouts from which to grab the field list.
         * @param modes List of modes identifying the layouts from which to grab the field list.
         * @param optionalFields Qualified field API names to retrieve in additional to those on the layout(s). If any are inaccessible then they are silently omitted.
         * @returns A thenable that resolves to an observable of the record.
         */getRecordWithLayouts(recordId,layoutTypes,modes,optionalFields){return this.getRecordWithLayoutsWithMetaConfig(recordId,layoutTypes,modes,optionalFields);}/**
         * WARNING: PLEASE DO NOT USE THIS METHOD DIRECTLY FROM RECORD SERVICE, CONTACT LDS TEAM FOR MORE INFORMATION
         * Note: This method is used to refresh the record by skipping the cache, and must not be exported to force-lds-records
         * Gets a record with layouts with with additional retrieval configuration.
         * @param recordId Id of the record to retrieve.
         * @param layoutTypes List of layoutTypes identifying the layouts from which to grab the field list.
         * @param modes List of modes identifying the layouts from which to grab the field list.
         * @param optionalFields Qualified field API names to retrieve in additional to those on the layout(s). If any are inaccessible then they are silently omitted.
         * @param metaConfig Retrieval configuration.
         *        forceProvide - if true then the cache is skipped
         *        successCallback - callback to be invoked after the refresh is complete
         *        errorCallback - callback to be invoked after the refresh fails
         * @returns An observable of the record.
         * @throws Throws an error when input fails validation.
         */getRecordWithLayoutsWithMetaConfig(recordId,layoutTypes,modes,optionalFields,metaConfig){if(!recordId){throw new Error("recordId must be provided");}if(!typeUtils.isArray(layoutTypes)){throw new Error("layoutTypes must be provided and must be an Array");}if(layoutTypes.length===0){throw new Error("layoutTypes must not be an empty Array");}const actualModes=modes?modes:["View"];const actualOptionalFields=optionalFields?optionalFields:[];let objectApiName;let recordTypeId;let record;let layouts=[];let objectInfo;// Try to get the record so we can grab the objectApiName and recordTypeId so we can get the metadata
    // necessary to figure out the fields on the layouts.
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return this._ldsCache.getValue(recordCacheKey).then(recordValueWrapper=>{if(recordValueWrapper!==undefined&&isWithinTtl(this._ldsCache.timeSource.now(),recordValueWrapper.lastFetchTime,RECORD_TTL)){record=recordValueWrapper.value;}}).then(()=>{if(record!==undefined){// Try to get the object info and layouts so we can get the fields list.
    objectApiName=record.apiName;recordTypeId=record.recordTypeInfo?record.recordTypeInfo.recordTypeId:MASTER_RECORD_TYPE_ID;const thenables=[];const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(record.apiName).build();thenables.push(this._ldsCache.getValue(objectInfoCacheKey));for(let layoutTypesLen=layoutTypes.length,layoutTypesIndex=0;layoutTypesIndex<layoutTypesLen;layoutTypesIndex++){for(let actualModesLen=actualModes.length,actualModesIndex=0;actualModesIndex<actualModesLen;actualModesIndex++){const layoutType=layoutTypes[layoutTypesIndex];const mode=actualModes[actualModesIndex];const layoutCacheKey=new LayoutCacheKeyBuilder().setObjectApiName(objectApiName).setLayoutType(layoutType).setMode(mode).setRecordTypeId(recordTypeId).build();thenables.push(this._ldsCache.getValue(layoutCacheKey));}}return Thenable.all(thenables);}return ThenableFactory.resolve(undefined);}).then(results=>{// Validate object info and layouts retrieved from cache.
    if(results){const objectInfoValueWrapper=results[0];if(objectInfoValueWrapper!==undefined&&isWithinTtl(this._ldsCache.timeSource.now(),objectInfoValueWrapper.lastFetchTime,OBJECT_INFO_TTL)){objectInfo=objectInfoValueWrapper.value;}const layoutValueWrappers=results.slice(1);for(let len=layoutValueWrappers.length,n=0;n<len;n++){const layoutValueWrapper=layoutValueWrappers[n];if(layoutValueWrapper!==undefined&&isWithinTtl(this._ldsCache.timeSource.now(),layoutValueWrapper.lastFetchTime,LAYOUT_TTL)){layouts.push(layoutValueWrapper.value);}else{layouts=undefined;break;}}}}).then(()=>{const fieldsOnLayouts=new UsefulSet();if(record&&objectInfo&&layouts&&typeUtils.isArray(layouts)&&layouts.length>0){// We have all the necessary metadata to get the fields on the given layouts, so let's get them!
    for(let len=layouts.length,n=0;n<len;n++){const layout=layouts[n];fieldsOnLayouts.addAll(getQualifiedFieldApiNamesFromLayout(layout,objectInfo));}return collectionToArray(fieldsOnLayouts);}// At this point we are unable to get the fields list for the layout from the cache because we lack the necessary metadata.
    // We need to retrieve this metadata from the server by making a bulk call to record ui (this will also
    // get us the record too so the call later to get the record will just be a cache hit!)
    const recordUiService=this._ldsCache.getService(RECORD_UI_VALUE_TYPE);return observableToPromise(recordUiService.getRecordUi([recordId],layoutTypes,actualModes,actualOptionalFields),true).then(recordUi=>{const layoutsKeys=Object.keys(recordUi.layouts);for(let layoutsKeysIndex=0,layoutsKeyIndexLength=layoutsKeys.length;layoutsKeysIndex<layoutsKeyIndexLength;++layoutsKeysIndex){const currObjectApiName=layoutsKeys[layoutsKeysIndex];const layoutsForObjectApiName=recordUi.layouts[currObjectApiName];const layoutsForObjectApiNameKeys=Object.keys(layoutsForObjectApiName);for(let layoutsForObjectApiNameKeysIndex=0,layoutsForObjectApiNameKeysLength=layoutsForObjectApiNameKeys.length;layoutsForObjectApiNameKeysIndex<layoutsForObjectApiNameKeysLength;++layoutsForObjectApiNameKeysIndex){const currRecordTypeId=layoutsForObjectApiNameKeys[layoutsForObjectApiNameKeysIndex];const layoutsForRecordTypeId=layoutsForObjectApiName[currRecordTypeId];const layoutsForRecordTypeIdKeys=Object.keys(layoutsForRecordTypeId);for(let layoutsForRecordTypeIdKeysIndex=0,layoutsForRecordTypeIdKeysLength=layoutsForRecordTypeIdKeys.length;layoutsForRecordTypeIdKeysIndex<layoutsForRecordTypeIdKeysLength;++layoutsForRecordTypeIdKeysIndex){const currLayoutType=layoutsForRecordTypeIdKeys[layoutsForRecordTypeIdKeysIndex];const layoutsForLayoutType=layoutsForRecordTypeId[currLayoutType];const layoutsForLayoutTypeKeys=Object.keys(layoutsForLayoutType);for(let layoutsForLayoutTypeKeysIndex=0,layoutsForLayoutTypeKeysLength=layoutsForLayoutTypeKeys.length;layoutsForLayoutTypeKeysIndex<layoutsForLayoutTypeKeysLength;++layoutsForLayoutTypeKeysIndex){const currMode=layoutsForLayoutTypeKeys[layoutsForLayoutTypeKeysIndex];const layout=layoutsForLayoutType[currMode];fieldsOnLayouts.addAll(getQualifiedFieldApiNamesFromLayout(layout,recordUi.objectInfos[recordUi.records[recordId].apiName]));}}}}return collectionToArray(fieldsOnLayouts);});}).then(fieldsOnLayout=>{// We finally have the fields on the layout, so now we can make a call to get the record.
    // NOTE: If we had to make the getRecordUi call earlier this will be a cache hit!
    return this._privateGetRecordWithFields(recordId,fieldsOnLayout,actualOptionalFields,undefined,false,false,metaConfig);});}/**
         * Creates a new record using the properties defined in the given recordInput.
         * @param recordInput The RecordInput object to use to create the record.
         * @returns A promise that will resolve with the newly created record.
         *          The record will contain data for the list of fields as defined by the applicable layout
         *          for the record
         */async createRecord(recordInput){if(!recordInput){throw new Error("recordInput must be provided");}if(!recordInput.fields){throw new Error("recordInput must have its fields property set");}if(!("allowSaveOnDuplicate"in recordInput)){recordInput.allowSaveOnDuplicate=false;}checkType(recordInput.allowSaveOnDuplicate,Boolean);const transportResponse=await _makeServerCall.call(this,undefined,"RecordUiController.createRecord",{recordInput});const newRecord=transportResponse.body;// Put the value into the cache by doing a get with a value provider that returns our newRecord object locally.
    // This will start the flow of going through all the due diligence of tracking fields, normalizing the record,
    // processing spanning records, etc.
    const newRecordCacheKey=recordServiceUtils.getRecordCacheKey(newRecord);const fieldSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(newRecord.apiName,newRecord,fieldSet);const recordValueProviderParams={cacheKey:newRecordCacheKey,recordId:newRecord.id,optionalFields:collectionToArray(fieldSet),forceProvide:true,localFreshRecord:newRecord,rootRecordMerge:false,informRecordLib:true,resolveRootMerge:false};const localValueProviderForNewRecord=this._createRecordValueProvider(recordValueProviderParams);const observableForNewRecord=this._privateGetRecordWithFields(newRecord.id,[],collectionToArray(fieldSet),localValueProviderForNewRecord);// Only resolve when we get an emit for the newRecord. Then we will know it is in the cache. Since we are passing in a local value provider that already has the record,
    // the observable will have emitted by the time the above statement returns. This means when we subscribe the hotness value will be the most recent.
    return observableToPromise(observableForNewRecord,false,1);}/**
         * Updates a given record with updates described in the given recordInput object. Must have the recordInput.fields.Id property set to the record id
         * of the record to update.
         * @param recordInput The record input representation to use to update the record.
         * @param clientOptions Should take ifUnmodifiedSince to check for conflicts for update
         * @returns A promise that will resolve with the patched record. The record will contain data for the list of fields as defined by the
         *          applicable layout for the record as well as any specified additionalFieldsToReturn.
         */async updateRecord(recordInput,clientOptions){if(!recordInput){throw new Error("recordInput must be provided");}if(!recordInput.fields||!recordInput.fields.Id){throw new Error("recordInput must have its fields.Id property set");}if(!("allowSaveOnDuplicate"in recordInput)){recordInput.allowSaveOnDuplicate=false;}checkType(recordInput.allowSaveOnDuplicate,Boolean);// TODO: When W-4302741 gets finished, update this code to request for additional fields for any that we might already be tracking
    // for the record. This will relinquish the need to make a separate GET call for getting a fresh copy of ALL the fields
    // we need.
    const transportResponse=await _makeServerCall.call(this,recordInput.fields.Id,"RecordUiController.updateRecord",{recordId:recordInput.fields.Id,recordInput,clientOptions});const updatedRecord=transportResponse.body;// Request a fresh copy of the record from UIAPI. This will ensure we get a fresh value for all the fields we are tracking. Force an eviction.
    const fieldSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(updatedRecord.apiName,updatedRecord,fieldSet);// Resolve the promise when the refresh has completed.
    const resultPromise=new Promise((resolve,reject)=>{const successCallback=()=>{resolve(this.stripETagsFromValue(updatedRecord));};const metaConfig={forceProvide:true,finishedCallbacks:{successCallback,errorCallback:reject}};this._privateGetRecordWithFields(updatedRecord.id,[],collectionToArray(fieldSet),undefined,true,true,metaConfig);});return resultPromise;}/**
         * Deletes a record given the recordId.
         * @param recordId The 18 char record ID for the record to be retrieved.
         * @returns A promise that will resolve to undefined.
         */async deleteRecord(recordId){if(!recordId){throw new Error("recordId must be provided");}await _makeServerCall.call(this,recordId,"RecordUiController.deleteRecord",{recordId});const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();this._ldsCache.evictAndDeleteObservable(recordCacheKey).then(()=>{this._ldsCache.clearDependencies(recordCacheKey);});}/**
         * Stage puts the given record.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param record The record to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,record,cacheAccessor,additionalData){return this.mergeRecordAndStagePut(dependentCacheKeys,record,cacheAccessor,additionalData.rootRecordMerge,additionalData.resolveRootMerge).then(()=>{return;});}/**
         * Strips all eTag properties from the record by directly deleting them (including nested records.)
         * @param record The record from which to strip the eTags.
         * @returns The same record object with its eTags stripped.
         */stripETagsFromValue(record){delete record.eTag;const fields=record.fields;if(fields){const fieldKeys=Object.keys(fields);for(let n=0,len=fieldKeys.length;n<len;n++){const field=fields[fieldKeys[n]];if(field){const fieldValue=field.value;if(recordServiceUtils.isRecordRepresentation(fieldValue)){// Found a spanning record, so let's recurse!
    this.stripETagsFromValue(fieldValue);}}}}return record;}/**
         * Adds the given objectApiName to the list of unsupported entities.
         * @param objectApiName The object api name to add to the list of unsupported entities.
         */addUnsupportedEntity(objectApiName){// TODO: can we remove this?
    this._unsupportedEntitiesSet.add(objectApiName);}/**
         * Do not use this - internal only.
         * TODO: Should we really be exporting it? ADS bridge is using it
         * @param recordId Id of the record to retrieve.
         * @param fields Qualified field API names to retrieve. If any are inaccessible then an error is emitted.
         * @param optionalFields Qualified field API names to retrieve. If any are inaccessible then they are silently omitted.
         * @param overrideValueProvider ValueProvider to fetch, normalize and cache the values.
         * @param returnFinalTransformedObservable True to return a finalTransformed observable, false for an observable whose emitted values are mutable.
         * @param forceProvide True to skip the cache and force a server call.
         * @param metaConfig Retrieval configuration.
         *        forceProvide - if true then the cache is skipped
         *        successCallback - callback to be invoked after the refresh is complete
         *        errorCallback - callback to be invoked after the refresh fails
         * @returns An observable of the record.
         */_privateGetRecordWithFields(recordId,fields,optionalFields,overrideValueProvider,returnFinalTransformedObservable,forceProvide,metaConfig){recordId=to18(recordId);const fieldList=(fields||[]).map(getFieldApiName);const optionalFieldList=(optionalFields||[]).map(getFieldApiName);const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const trackedRecordFields=this.getFieldsForRecord(recordId);const refreshRecordFields=this.getADSFieldsForRecord(recordId);const requestedFields=new UsefulSet(fieldList).addAll(optionalFieldList);const requestOnlyHasTrackedFields=trackedRecordFields.containsAll(requestedFields);// Adjust the optional fields we're requesting to include any other fields we're tracking that aren't already part of the required fields
    // Using Array.push to join the new fields from requestedFields instead of UsefulSet.addAll because when sets are converted to arrays
    // via collectionToArray the ordering is determined by insertion order of items. Any additional fields should be appended to preserve ordering.
    const newFields=collectionToArray(requestedFields.difference(trackedRecordFields));const adjustedOptionalFields=collectionToArray(trackedRecordFields);for(let len=newFields.length,n=0;n<len;n++){adjustedOptionalFields.push(newFields[n]);}forceProvide=forceProvide||!trackedRecordFields.containsAll(adjustedOptionalFields)||metaConfig&&metaConfig.forceProvide;trackedRecordFields.addAll(adjustedOptionalFields);// Make sure we're tracking all requested fields.
    // Add in fields that ADS has requested but LDS is not interested in.
    if(refreshRecordFields){const refreshFields=collectionToArray(refreshRecordFields.difference(adjustedOptionalFields));for(let len=refreshFields.length,n=0;n<len;n++){adjustedOptionalFields.push(refreshFields[n]);}}const recordValueProviderParams={cacheKey,recordId,optionalFields:adjustedOptionalFields,forceProvide,rootRecordMerge:false,informRecordLib:true,resolveRootMerge:false};const valueProvider=overrideValueProvider?overrideValueProvider:this._createRecordValueProvider(recordValueProviderParams);const filteredRecordCacheKey=new FilteredRecordKeyBuilder().setRecordId(recordId).setRequiredFields(fieldList).setOptionalFields(optionalFieldList).build();const finishedCallbacks=metaConfig&&metaConfig.finishedCallbacks;this._ldsCache.get(cacheKey,valueProvider,finishedCallbacks);const observables=this._ldsCache.getOrCreateObservables(cacheKey,this.getCacheValueTtl());this._recordIdsToReadOnlyObservablesMap.set(recordId,observables.finalTransformed);// check if we already have a filtered observable for the fields, and create it if not
    const _filteredObservables=this._filteredObservables;let filteredObservable=_filteredObservables.get(filteredRecordCacheKey.getKey());if(!filteredObservable){// We pass observables.root here so that any new filteredObservable chain gets all emits from the root.
    filteredObservable=_constructFilteredObservable.call(this,filteredRecordCacheKey,observables.root,fieldList,optionalFieldList,requestOnlyHasTrackedFields);_filteredObservables.set(filteredRecordCacheKey.getKey(),filteredObservable);}if(returnFinalTransformedObservable){return observables.finalTransformed;}return filteredObservable;}/**
         * Get tracked fields for the given record from an in-memory Map
         * @param recordId The record id.
         * @returns the tracked fields for the record
         */getFieldsForRecord(recordId){// Check to see if we've ever requested these fields before.
    const _recordIdsToFieldsRequestedMap=this._recordIdsToFieldsRequestedMap;let trackedRecordFields=_recordIdsToFieldsRequestedMap.get(recordId);if(!trackedRecordFields){trackedRecordFields=new UsefulSet();_recordIdsToFieldsRequestedMap.set(recordId,trackedRecordFields);}return trackedRecordFields;}/**
         * Set fields requested by ADS, that LDS is not interested in for the given record from an in-memory Map
         * @param recordId The record id.
         * @returns the tracked fields for the record
         */setADSFieldsForRecord(recordId){// Check to see if we've ever requested these fields before.
    const _recordIdsToFieldsToRefreshMap=this._recordIdsToFieldsToRefreshMap;let refreshRecordFields=_recordIdsToFieldsToRefreshMap.get(recordId);if(!refreshRecordFields){refreshRecordFields=new UsefulSet();_recordIdsToFieldsToRefreshMap.set(recordId,refreshRecordFields);}return refreshRecordFields;}/**
         * Get fields requested by ADS, that LDS is not interested in for the given record from an in-memory Map
         * @param recordId
         * @returns the tracked fields for the record
         */getADSFieldsForRecord(recordId){// Check to see if we've ever requested these fields before.
    const _recordIdsToFieldsToRefreshMap=this._recordIdsToFieldsToRefreshMap;const refreshRecordFields=_recordIdsToFieldsToRefreshMap.get(recordId);return refreshRecordFields;}/**
         * Record UI service (and possibly others?) sometimes need to inform record service to track fields that aren't
         * necessarily in the record they are normalizing. For instance, when record ui gets a record by layout type and mode,
         * all the fields in the layout won't necessarily be returned in the record (spanning id fields might not be set so those
         * fields won't get returned on the record even though they are on the layout!).
         * @param recordId The record id.
         * @param fields A list of fields to add to the tracked fields list for the given recordId.
         */addFieldsToTrack(recordId,fields){const trackedRecordFields=this.getFieldsForRecord(recordId);trackedRecordFields.addAll(fields);}/**
         * TODO: Reexamine why record-uis.js needs this function. Should we really be exporting it?!
         * @param rootRecord Root record stored in LDS cache
         * @returns record fields for that root record
         */gatherAndTrackSpanningFields(rootRecord){const recordFieldsSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(rootRecord.apiName,rootRecord,recordFieldsSet);const trackedRecordFields=this.getFieldsForRecord(rootRecord.id);trackedRecordFields.addAll(recordFieldsSet);return recordFieldsSet;}/**
         * Takes an array of denormalized root records and does the work of normalizing and merging the root and all nested records.
         * Finally it stages puts for all records.
         * @param dependentCacheKeysArray The common cache keys that depend on all of these records - required but may be empty.
         *        This list will be added to any other dependent cache keys already being tracked for these records.
         * @param denormalizedRecordsArray The denormalized root records to be cached.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param rootRecordMerge RecordService has an addRecord() method which is used by ADS to add records into LDS cache. When this is called from
         *        addRecords() we need to merge the ADS record with what exists in the LDS cache because LDS may be tracking more fields than ADS is giving us.
         *        For scenarios within the LDS Records Module, if we have fetched a fresh value from the server and if it's a root record, there is no need for a
         *        merge because LDS should have retrieved all necessary fields.
         * @returns A Thenable that resolves to the array of cache keys for the records to be cached or refreshed as a
         *          result of this operation. The array should not contain duplicate cache keys.
         */mergeRecordsAndStagePuts(dependentCacheKeysArray,denormalizedRecordsArray,cacheAccessor,rootRecordMerge){const thenables=[];const cacheKeysMap=new Map();for(let len=denormalizedRecordsArray.length,c=0;c<len;++c){const denormalizedRecord=denormalizedRecordsArray[c];thenables.push(this.mergeRecordAndStagePut(dependentCacheKeysArray,denormalizedRecord,cacheAccessor,rootRecordMerge,false));}// Merge all returned cache keys into one array, not an array of arrays. Also remove duplicate keys if any.
    return Thenable.all(thenables).then(arrayOfArrayOfCacheKeys=>{for(let len=arrayOfArrayOfCacheKeys.length,c=0;c<len;++c){const arrayOfCacheKeys=arrayOfArrayOfCacheKeys[c];for(let length1=arrayOfCacheKeys.length,i=0;i<length1;++i){const cacheKey=arrayOfCacheKeys[i];cacheKeysMap.set(cacheKey.getKey(),cacheKey);}}return Array.from(cacheKeysMap.values());});}/**
         * Takes a denormalized root record and does the work of normalizing and merging the root and all nested records.
         * Finally it stages puts for all merged records.
         * @param dependentCacheKeysArray The cache keys that depend on this record - required but may be empty. This list
         *        will be added to any other dependent cache keys already being tracked for this record.
         * @param denormalizedRecord The denormalized root record to be cached.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param rootRecordMerge RecordService has an addRecord() method which is used by ADS to add records into LDS cache. When this is called from
         *        addRecords() we need to merge the ADS record with what exists in the LDS cache because LDS may be tracking more fields than ADS is giving us.
         *        For scenarios within the LDS Records Module, if we have fetched a fresh value from the server and if it's a root record, there is no need for a
         *        merge because LDS should have retrieved all necessary fields.
         * @param resolveRootMerge true if during merge for a root record we should accept the record even if it has fewer fields than the existing record.
         * @returns A Thenable that resolves to the array of cache keys for the records to be cached or refreshed as a
         *          result of this operation. The array should not contain duplicate cache keys.
         */mergeRecordAndStagePut(dependentCacheKeysArray,denormalizedRecord,cacheAccessor,rootRecordMerge,resolveRootMerge){// Check for view entities. LDS does not currently support view entities, so this we check to make sure they don't end up in the cache.
    // If they are cached without proper support they can "stomp" other records of a primary entity because they often share IDs.
    {assert$1(!recordServiceUtils.isKnownViewEntity(denormalizedRecord.apiName),`View entities are not supported: ${denormalizedRecord.apiName}`);if(!denormalizedRecord.lastModifiedById||!denormalizedRecord.lastModifiedDate||!denormalizedRecord.systemModstamp){// tslint:disable-next-line:no-console
    console.log(`target record is missing required properties(lastModifiedDate, systemModstamp, lastModifiedById): ${JSON.stringify(denormalizedRecord)}`);}}this._objectNameToIsWhitelistedMap.set(denormalizedRecord.apiName,true);if(!rootRecordMerge){// This is a full value replacement, so clear old dependencies and let them be recalculated.
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(denormalizedRecord.id).build();cacheAccessor.stageClearDependencies(recordCacheKey);}// The normalized records(including spanning records with dependencies).
    const normalizedRecordsWithDependencies=_getNormalizedRecordsWithDependencies.call(this,denormalizedRecord,cacheAccessor,dependentCacheKeysArray,0);// Merge fields across the normalized records.
    const cacheKeyToNormalizedRecordsWithDependenciesMap=new Map();for(let len=normalizedRecordsWithDependencies.length,n=0;n<len;n++){const normalizedRecordWithDependencies=normalizedRecordsWithDependencies[n];if(cacheKeyToNormalizedRecordsWithDependenciesMap.has(normalizedRecordWithDependencies.sourceCachekey.getKey())){const normalizedRecordWithDependenciesFromMap=cacheKeyToNormalizedRecordsWithDependenciesMap.get(normalizedRecordWithDependencies.sourceCachekey.getKey());if(normalizedRecordWithDependenciesFromMap){// Use non-null LastModifiedById, LastModifiedDate, SystemModstamp as these could be null for the same record occuring multiple times.
    normalizedRecordWithDependencies.objectToCache.lastModifiedById=normalizedRecordWithDependencies.objectToCache.lastModifiedById||normalizedRecordWithDependenciesFromMap.objectToCache.lastModifiedById;normalizedRecordWithDependencies.objectToCache.lastModifiedDate=normalizedRecordWithDependencies.objectToCache.lastModifiedDate||normalizedRecordWithDependenciesFromMap.objectToCache.lastModifiedDate;normalizedRecordWithDependencies.objectToCache.systemModstamp=normalizedRecordWithDependencies.objectToCache.systemModstamp||normalizedRecordWithDependenciesFromMap.objectToCache.systemModstamp;Object.assign(normalizedRecordWithDependencies.objectToCache.fields,normalizedRecordWithDependenciesFromMap.objectToCache.fields);Object.assign(normalizedRecordWithDependencies.objectToEmit.fields,normalizedRecordWithDependenciesFromMap.objectToEmit.fields);}}cacheKeyToNormalizedRecordsWithDependenciesMap.set(normalizedRecordWithDependencies.sourceCachekey.getKey(),normalizedRecordWithDependencies);}return _mergeRecordsAndStagePuts.call(this,normalizedRecordsWithDependencies,cacheAccessor,rootRecordMerge,resolveRootMerge);}/**
         * Affected Key handler for record.
         * @param affectedKey CacheKey for the value which might be affected by this operation
         * @param cacheAccessor An object to transactionally access the cache.
         * @returns Thenable of the uiapi.RecordRepresentation | undefined
         */_recordAffectedKeyHandler(affectedKey,cacheAccessor){const ldsCache=this._ldsCache;return cacheAccessor.get(affectedKey).then(normalizedRecordValueWrapper=>{if(normalizedRecordValueWrapper&&normalizedRecordValueWrapper.value){return this.denormalizeRecord(normalizedRecordValueWrapper.value,cacheAccessor).then(record=>{if(record){const recordValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(normalizedRecordValueWrapper,record);cacheAccessor.stageEmit(affectedKey,recordValueWrapperToEmit);return record;}// Denormalization of record failed since record was deleted, proceed to refresh
    const recordId=affectedKey.getLocalKey();const optionalFields=this.getFieldsForRecord(recordId);this._privateGetRecordWithFields(recordId,[],collectionToArray(optionalFields),undefined,false,true);return;});}else if(ldsCache.getObservables(affectedKey)){// There is an observable for this affectedKey but we couldn't find its value in the cache.
    // TODO W-4485745: If we can't denormalize the Record, we should do the following:
    // - Don't emit yet.
    // - Refresh the value from server.
    {assert$1(false,`Need to denorm/emit a Record we no longer have in cache: ${affectedKey.getKey()}`);}}return undefined;});}/**
         * Constructs a value provider to retrieve a Record.
         * @param valueProviderParameters: { cacheKey, recordId, optionalFields, forceProvide = false, record, rootRecordMerge = false, informRecordLib = true } -
         *        The parameters for the value provider as an object. Each object should contain the following fields:
         *        - cacheKey: CacheKey - The relevant cache key for the Record.
         *        - recordId: Array<string> - The 18 char IDs of the records to retrieve.
         *        - optionalFields: Array<string> - This array should contain every field being tracked for this record as well as any new fields we need to get.
         *        - forceProvide: boolean - True if we need to get fresh value from the server or use the provided value (record param) and skip the cache,
         *          otherwise false. Optional - defaults to false.
         *        - record: object - A Record value you want explicitly put into cache - should be used in conjunction with a true value for forceProvide. When
         *          this is done, no actual API call will be made.
         *        - rootRecordMerge: boolean - RecordService has an addRecord() method which is used by ADS to add records into LDS cache. When this is called from
         *          addRecords() we need to merge the ADS record with what exists in the LDS cache because LDS may be tracking more fields than ADS is giving us.
         *          For scenarios within the LDS Records Module, if we have fetched a fresh value from the server and if it's a root record, there is no need for a
         *          merge because LDS should have retrieved all necessary fields. Optional - defaults to false.
         *        - informRecordLib: boolean - true if this should notify recordLibrary of any records being added due to this operation, otherwise false.
         *        - resolveRootMerge: boolean - true if during merge for a root record we should accept the record even if it has fewer fields than the existing record.
         *          defaults to false.
         * @param vpEqualsFn - a value provider equals function that allows the caller to specify whether to debounce the valueprovider or not
         * @returns ValueProvider: The value provider to retrieve a Record.
         */_createRecordValueProvider(valueProviderParameters,vpEqualsFn){const valueProvider=new ValueProvider((cacheAccessor,{// Do NOT set defaults here. See W-4840393.
    cacheKey,recordId,optionalFields,forceProvide,localFreshRecord,rootRecordMerge,informRecordLib,resolveRootMerge})=>{// Explicitly set defaults. Cannot use deconstruction in function param due to EDGE issue. See W-4840393
    forceProvide=forceProvide||false;informRecordLib=informRecordLib===undefined?true:informRecordLib;resolveRootMerge=resolveRootMerge||false;if(informRecordLib){// If we need to inform recordLibrary of new records, wrap the cache accessor which will track all new things in this
    // cache operation and let commitPuts() handle the informs.
    cacheAccessor=recordServiceUtils.wrapCacheAccessor(cacheAccessor,this._adsBridge);}if(forceProvide){return _getFreshValue.call(this,cacheAccessor,cacheKey,recordId,optionalFields,rootRecordMerge,localFreshRecord,resolveRootMerge);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+RECORD_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return _getFreshValue.call(this,cacheAccessor,cacheKey,recordId,optionalFields,rootRecordMerge,localFreshRecord,resolveRootMerge);}// Value is not stale, but we still need to validate the cached value
    return _validateExistingRecordCacheValue.call(this,cacheAccessor,existingValueWrapper.value).then(value=>{if(value){return ValueProviderResult.CACHE_HIT;}// Existing value is not valid; get a fresh value.
    return _getFreshValue.call(this,cacheAccessor,cacheKey,recordId,optionalFields,rootRecordMerge,localFreshRecord,resolveRootMerge);});}// No existing value; get a fresh value.
    return _getFreshValue.call(this,cacheAccessor,cacheKey,recordId,optionalFields,rootRecordMerge,localFreshRecord,resolveRootMerge);});},valueProviderParameters,vpEqualsFn);return valueProvider;}/**
         * Takes the normalized record and cacheAccessor and returns the denormalized record.
         * @param normalizedRecord The record to denormalized. This should always be a normalized record that came from the cache.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param depth This is a recursive call and this parameter is used to indicate what depth we're at so in cyclical cases we don't
         *        continue denormalizing forever. The SOQL limit is 5 levels, so this will denormalize to a depth of 5. Most callers do not need to
         *        provide this since they are denormalizing a top level record, so this param is optional.
         * @returns A Thenable that will resolve to the denormalized record or undefined if a nested record can't be found in the cache.
         */denormalizeRecord(normalizedRecord,cacheAccessor,depth=0){// MAX_DEPTH is the SOQL limit, so we don't denorm past MAX_DEPTH levels.
    if(depth>MAX_DEPTH){return Thenable.resolve(undefined);}const thenables=[];const denormalizedRecord=clone(normalizedRecord,recordServiceUtils.getRecordCacheKey(normalizedRecord));const denormalizedRecordFields=denormalizedRecord.fields;{assert$1(denormalizedRecordFields,`Where are the denormalizedRecordFields? ${denormalizedRecordFields}`);}const denormalizedRecordFieldsArray=Object.entries(denormalizedRecordFields);for(let len=denormalizedRecordFieldsArray.length,n=0;n<len;n++){const[fieldName,field]=denormalizedRecordFieldsArray[n];{assert$1(field,`Found malformed field with no field value structure: ${fieldName}, ${field}`);}if(field.value&&cacheValueMarkerUtils.isRecordMarker(field.value)){const fieldValue=field.value;const recordId=fieldValue.id;const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();thenables.push(cacheAccessor.get(cacheKey).then(spanningRecordValueWrapper=>{if(!spanningRecordValueWrapper){// TODO: W-5450972 maybe the record LRUed out =( -- consider if we should make this impossible (run out of memory instead?).
    return ThenableFactory.reject(getLdsInternalError("DENORMALIZE_FAILED",`Did not find record for '${recordId}'`,false));}const normalizedSpanningRecord=spanningRecordValueWrapper.value;// If depth is more than MAX_DEPTH do not try to denormalize further. This can happen in case we have a cycle in denorm records.
    if(Math.max(depth+1,fieldValue.depth)>MAX_DEPTH){// Delete the spanning field as we do not want to gather field names via recursivelyGatherFieldNames for the parent record.
    delete denormalizedRecordFields[fieldName];return ThenableFactory.resolve(denormalizedRecord);}// Proceed to denormalize spanning record.
    return this.denormalizeRecord(normalizedSpanningRecord,cacheAccessor,Math.max(depth+1,fieldValue.depth)).then(denormalizedSpanningRecord=>{if(denormalizedSpanningRecord){const spanningRecordMarkerFieldsArray=fieldValue.fields;const fieldsInSpanningRecordSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(denormalizedSpanningRecord.apiName,denormalizedSpanningRecord,fieldsInSpanningRecordSet);const hasAllNecessaryFields=fieldsInSpanningRecordSet.containsAll(spanningRecordMarkerFieldsArray.filter(fieldApiName=>!fieldApiName.endsWith("__r")));if(!hasAllNecessaryFields){// We don't have enough fields to satisfy the marker. This is effectively a cache miss.
    // Check the conflict records map for an entry and if an entry exists, utilize the value from map to denorm the record correctly.
    const recordFromConflictRecordsMap=this._mergeConflictRecordsMap.get(normalizedSpanningRecord.id);if(!recordFromConflictRecordsMap){const spanningRecordFieldsArray=collectionToArray(fieldsInSpanningRecordSet);// the conflict records map also does not have an entry for this record and thereby we cannot denorm the record correctly.
    const missingFieldsError=JSON.stringify({expectedFields:spanningRecordMarkerFieldsArray,actualFields:spanningRecordFieldsArray});return ThenableFactory.reject(getLdsInternalError("DENORMALIZE_FAILED",`Did not find all necessary fields for record: '${recordId}': '${missingFieldsError}'`,true));}const spanningRecordMarkerFieldsSet=new UsefulSet();spanningRecordMarkerFieldsSet.addAll(spanningRecordMarkerFieldsArray);const missingFields=collectionToArray(spanningRecordMarkerFieldsSet.difference(fieldsInSpanningRecordSet));for(let fieldsLength=missingFields.length,m=0;m<fieldsLength;m++){const apiNameReg=new RegExp(`^${denormalizedSpanningRecord.apiName}\\.`);const fieldApiName=missingFields[m].replace(apiNameReg,"");const missingFieldValue=recordFromConflictRecordsMap.fields[fieldApiName];if(missingFieldValue===undefined){if(fieldApiName.endsWith("__r")){denormalizedSpanningRecord.fields[fieldApiName]={value:null,displayValue:null};}else{const spanningRecordFieldsArray=collectionToArray(fieldsInSpanningRecordSet);// the conflicts records map does not contain a value for a field.
    const missingFieldError=JSON.stringify({expectedFields:spanningRecordMarkerFieldsArray,actualFields:spanningRecordFieldsArray});return ThenableFactory.reject(getLdsInternalError("DENORMALIZE_FAILED",`Did not find all necessary fields in the conflict records map for record: '${recordId}': '${missingFieldError}'`,true));}}denormalizedSpanningRecord.fields[fieldApiName]=missingFieldValue;}}// TODO: ideally we'd keep track of the name field (in extra properties?) and use that instead of hardcoding 'Name' which
    // is right most of the time but not all of the time. We need to examine the ObjectInfo to get the correct Name field
    // 100% of the time.
    // Note: the use of null over undefined below is intentional -- since this is a serializable JSON payload we will be using
    // null rather than undefined.
    // Note: we cast from NormalizedFieldValueRepresentation to uiapi.FieldValueRepresentation deliberately: we are denorm'ing
    const nameField=normalizedSpanningRecord.fields.Name;const nameFieldDisplayValue=nameField!==undefined?nameField.displayValue:null;const nameFieldValue=nameField!==undefined?nameField.value:null;// Use the old displayValue we had if we can't find a new one to use.
    const displayValue=nameField&&nameFieldDisplayValue||nameFieldValue||field.displayValue;denormalizedRecordFields[fieldName]={displayValue,value:denormalizedSpanningRecord};}return Thenable.resolve(denormalizedSpanningRecord);});},rejectionReason=>{logger.logError(`Got an unexpected Thenable rejection while looking for ${recordId} in the cache accessor: '${rejectionReason}'`);}));}}return Thenable.all(thenables).then(()=>{// With the Thenable.all() here we are simply waiting until all necessary spanning field denormalizations and replacements have occurred, then
    // returning the final denormalized record. We are not actually using the results of those Thenables as they've already modified the denormalizedRecord.
    return denormalizedRecord;}).catch(rejectionReason=>{logger.logError(`Denormalizing failed with rejection reason as ${JSON.stringify(rejectionReason)}`);// If we can't fully denormalize a record then we return undefined.
    return Thenable.resolve(undefined);});}}/**
     * Gets a fresh value and processes it into the cache with the cacheAccessor.
     * @param cacheAccessor An object to transactionally access the cache.
     * @param cacheKey The cache key for the record.
     * @param recordId The record id for the record.
     * @param optionalFields The list of optional fields for the record.
     * @param rootRecordMerge True if the cache should attempt to merge the record values instead of replacing them.
     * @param localFreshRecord Optional. A record value you want explicitly put into cache instead of getting the value from the server.
     * @param resolveRootMerge true if during merge for a root record we should accept the record even if it has fewer fields than the existing record.
     * @returns Returns a string representing the outcome of the value provider.
     */function _getFreshValue(cacheAccessor,cacheKey,recordId,optionalFields,rootRecordMerge,localFreshRecord,resolveRootMerge){let transportResponseThenable;// If the record is provided, we don't go to server to fetch it.
    if(localFreshRecord){transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshRecord));}else{const params={recordId,fields:[],optionalFields};transportResponseThenable=_makeServerCall.call(this,recordId,"RecordUiController.getRecordWithFields",params,"getRecord");}return transportResponseThenable.then(transportResponse=>{// Cache miss.
    // It's a cache miss and we are going normalize, mark, and merge the spanning records, then stage and commit puts for the
    // records which are merged successfully. Finally we will denorm and stage emits for affected records that haven't changed
    // but depend on changed records.
    const freshRecord=transportResponse.body;return this.mergeRecordAndStagePut([],freshRecord,cacheAccessor,rootRecordMerge,resolveRootMerge);}).then(()=>{const affectedCacheKeys=cacheAccessor.commitPuts();// we are here, because ADS gave us records or we requested records from within LDS.
    // so if the conflict records map has an entry then delete the entry.
    // @ts-ignore TODO: remove the ts-ignore when these methods get moved into the class as private methods.
    this._mergeConflictRecordsMap.delete(recordId);return affectedCacheKeys;}).then(affectedKeys=>{// TODO - cacheAccessor as CacheAccessor is likely a bug!
    return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}/**
     * Returns true if the existing formUi cache value is valid, else false.
     * @param cacheAccessor The cacheAccessor.
     * @param normalizedRecord The existing recordUi cache value.
     * @returns Thenable of boolean
     */function _validateExistingRecordCacheValue(cacheAccessor,normalizedRecord){if(normalizedRecord){// @ts-ignore
    if(!this._objectNameToIsWhitelistedMap.has(normalizedRecord.apiName)){return ThenableFactory.resolve(false);}}return this.denormalizeRecord(normalizedRecord,cacheAccessor).then(denormalizedRecord=>{return !!denormalizedRecord;});}/**
     * Returns an array of objects {dependentCacheKeysArray, recordCacheKey, normalizedRecord, denormalizedRecord, isRoot} that will be
     * used to normalized and merge the record and any nested records into the cache.
     * @param denormalizedRecord A denormalized record or record we get from UI-API.
     * @param cacheAccessor The CacheAccessor in scope for this operation.
     * @param dependentCacheKeysArray An array of zero or more cache keys that depend on the key/value being staged. These are used
     *        by the cache to track dependencies for consumers and let them know what they have affected in the return value of commitPuts().
     * @param depth This is a recursive call and this parameter is used to indicate what depth we're at so in cyclical cases we don't
     *        continue denormalizing forever. The SOQL limit is 5 levels, so this will denormalize to a depth of 5. Callers should also provide a
     *        correct value consciously in this case, so this param is required.
     * @returns Returns an array of StagePutObject {dependentCacheKeysArray, recordCacheKey, normalizedRecord, denormalizedRecord, isRoot}
     *          that will be used to normalized and merge the record and any nested records into the cache.
     */function _getNormalizedRecordsWithDependencies(denormalizedRecord,cacheAccessor,dependentCacheKeysArray,depth){{assert$1(depth>=0&&depth<=5,`Invalid depth: ${depth}`);}const normalizedRecord=clone(denormalizedRecord,recordServiceUtils.getRecordCacheKey(denormalizedRecord));let normalizedRecordsArrayWithDependencies=[];const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(normalizedRecord.id).build();const normalizedRecordFieldsArray=Object.keys(normalizedRecord.fields);for(let len=normalizedRecordFieldsArray.length,n=0;n<len;n++){const fieldName=normalizedRecordFieldsArray[n];const normalizedRecordFieldValue=normalizedRecord.fields[fieldName].value;// TODO: Do NOT cache spanning records that have apiName === "Name" because we have not figured out yet how to deal with record stomping scenarios in LDS.
    // Optimially the salesforce APIs will be fixed so they don't return inconsistent data.
    if(recordServiceUtils.isRecordRepresentation(normalizedRecordFieldValue)&&normalizedRecordFieldValue.apiName!=="Name"){const spanningRecord=normalizedRecordFieldValue;const spanningRecordDepth=depth+1;const normalizedSpanningRecordWithDependencies=_getNormalizedRecordsWithDependencies.call(this,spanningRecord,cacheAccessor,[recordCacheKey],spanningRecordDepth);normalizedRecordsArrayWithDependencies=normalizedRecordsArrayWithDependencies.concat(normalizedSpanningRecordWithDependencies);const marker=recordMarkerUtils.toRecordMarker(cacheAccessor,spanningRecord,spanningRecordDepth);normalizedRecord.fields[fieldName].value=marker;}}const isRoot=depth===0;const eTag=normalizedRecord.eTag;// Delete the eTag. We don't want to store the eTag as part of the value!
    delete normalizedRecord.eTag;// Delete the eTags from the denormalizedRecord. We don't want to emit values with eTag properties!
    denormalizedRecord=this.stripETagsFromValue(denormalizedRecord);normalizedRecordsArrayWithDependencies.push(new StagePutObject(dependentCacheKeysArray,recordCacheKey,normalizedRecord,denormalizedRecord,isRoot,eTag));return normalizedRecordsArrayWithDependencies;}/**
     * Given the provided normalized records (root and spanning), this goes through all the records, merges them, and and stages puts for them.
     * @param normalizedRecordsWithDependencies Each object in the array should look like
     *        { dependentRecordKeyArray, recordCacheKey, normalizedRecord, denormalizedRecord, isRoot }.
     * @param cacheAccessor The CacheAccessor in scope for this operation.
     * @param rootRecordMerge RecordService has an addRecord() method which is used by ADS to add records into LDS cache. When this is called from
     *        addRecords() we need to merge the ADS record with what exists in the LDS cache because LDS may be tracking more fields than ADS is giving us.
     *        For scenarios within the LDS Records Module, if we have fetched a fresh value from the server and if it's a root record, there is no need for a
     *        merge because LDS should have retrieved all necessary fields.
     * @param resolveRootMerge true if during merge for a root record we should accept the record even if it has fewer fields than the existing record.
     * @returns A Thenable that resolves to the array of cache keys for the records to be cached or refreshed as a
     *          result of this operation. The array should not contain duplicate cache keys.
     */function _mergeRecordsAndStagePuts(normalizedRecordsWithDependencies,cacheAccessor,rootRecordMerge,resolveRootMerge){const thenables=[];for(let len=normalizedRecordsWithDependencies.length,n=0;n<len;n++){const normalizedRecordWithDependencyInfo=normalizedRecordsWithDependencies[n];thenables.push(cacheAccessor.get(normalizedRecordWithDependencyInfo.sourceCachekey).then(existingValue=>{if(existingValue){const mergedNormalizedRecord=_mergeRecord.call(this,existingValue.value,normalizedRecordWithDependencyInfo.objectToCache,rootRecordMerge,normalizedRecordWithDependencyInfo.root,resolveRootMerge);if(mergedNormalizedRecord){this.gatherAndTrackSpanningFields(normalizedRecordWithDependencyInfo.objectToEmit);return this.denormalizeRecord(mergedNormalizedRecord,cacheAccessor).then(denormalizedRecord=>{cacheAccessor.stagePut(normalizedRecordWithDependencyInfo.dependentCacheKeysArray,normalizedRecordWithDependencyInfo.sourceCachekey,mergedNormalizedRecord,denormalizedRecord,{eTag:normalizedRecordWithDependencyInfo.eTag});}).then(()=>{return normalizedRecordWithDependencyInfo.sourceCachekey;});}// The merge wasn't successful so a full record refresh should have been queued, however we still need to track that
    // things depend on this record, so track the dependencies.
    if(normalizedRecordWithDependencyInfo.dependentCacheKeysArray&&normalizedRecordWithDependencyInfo.dependentCacheKeysArray.length>0){cacheAccessor.stageDependencies(normalizedRecordWithDependencyInfo.dependentCacheKeysArray,normalizedRecordWithDependencyInfo.sourceCachekey);}}else{this.gatherAndTrackSpanningFields(normalizedRecordWithDependencyInfo.objectToEmit);cacheAccessor.stagePut(normalizedRecordWithDependencyInfo.dependentCacheKeysArray,normalizedRecordWithDependencyInfo.sourceCachekey,normalizedRecordWithDependencyInfo.objectToCache,normalizedRecordWithDependencyInfo.objectToEmit,{eTag:normalizedRecordWithDependencyInfo.eTag});}return Thenable.resolve(normalizedRecordWithDependencyInfo.sourceCachekey);}));}return Thenable.all(thenables).then(cacheKeysArray=>{const cacheKeysMap=new Map();for(let len=cacheKeysArray.length,c=0;c<len;c++){const cacheKey=cacheKeysArray[c];cacheKeysMap.set(cacheKey.getKey(),cacheKey);}return Array.from(cacheKeysMap.values());});}/**
     * Adds all fields found in the given normalizedRecord into the provided fieldNamesSet. Produces fully qualified field names.
     * Since this is a normalized record there is no recursion because there is no nested spanning records, only markers.
     * @param normalizedRecord The relevant normalized record.
     * @param fieldNamesSet The set being used to gather all field names. This is an in/out parameter - all fields
     *        will be added to this set.
     */function _gatherFieldNamesFromNormalizedRecord(normalizedRecord,fieldNamesSet){const fieldNamesArray=Object.keys(normalizedRecord.fields);const apiName=normalizedRecord.apiName;for(let fieldNamesArrayIndex=0,fieldNamesArrayLength=fieldNamesArray.length;fieldNamesArrayIndex<fieldNamesArrayLength;++fieldNamesArrayIndex){const fieldName=fieldNamesArray[fieldNamesArrayIndex];const fieldValue=normalizedRecord.fields[fieldName].value;const fieldExpression=`${apiName}.${fieldName}`;if(cacheValueMarkerUtils.isRecordMarker(fieldValue)){const unqualifiedFieldNames=recordMarkerUtils.getUnqualifiedFieldNamesFromRecordMarker(fieldValue);// Qualify the field names by adding the api name and field name to each unqualified field name. Example: Opportunity.Owner.Id;
    for(let unqualifiedFieldNamesIndex=0,length=unqualifiedFieldNames.length;unqualifiedFieldNamesIndex<length;++unqualifiedFieldNamesIndex){const unqualifiedFieldName=unqualifiedFieldNames[unqualifiedFieldNamesIndex];const qualifiedFieldName=`${fieldExpression}.${unqualifiedFieldName}`;fieldNamesSet.add(qualifiedFieldName);}}else if(recordServiceUtils.isRecordRepresentation(fieldValue)){// The only reason we should have a RecordRepresentation instead of a marker in a normalizedRecord is if it is a Name object. We need to recurse into
    // the RecordRepresentation to get those field names too. We need a solution to normalize polymorphic spanning fields: W-5188138.
    recordServiceUtils.recursivelyGatherFieldNames(fieldExpression,fieldValue,fieldNamesSet);}else{fieldNamesSet.add(fieldExpression);}}}/**
     * Returns true if the second record contains all the fields that the first record has.
     *
     * Exported only for tests!
     *
     * @param firstRecord the first record.
     * @param secondRecord the second record.
     * @returns true if the second record contains all the fields that the first record has, otherwise false.
     */function _secondRecordContainsAllFieldsInFirstRecord(firstRecord,secondRecord){const firstRecordFields=new UsefulSet();_gatherFieldNamesFromNormalizedRecord(firstRecord,firstRecordFields);const secondRecordFields=new UsefulSet();_gatherFieldNamesFromNormalizedRecord(secondRecord,secondRecordFields);return secondRecordFields.containsAll(firstRecordFields);}/**
     * Returns a merged and normalized record. If the merge results in a conflict, we request fresh record with all tracked fields for the record.
     * @param existingNormalizedRecord The existing record in the cache.
     * @param newNormalizedRecord The new record we want to merge into the cache.
     * @param rootRecordMerge RecordService has an addRecord() method which is used by ADS to add records into LDS cache. When this is called from
     *        addRecords() we need to merge the ADS record with what exists in the LDS cache because LDS may be tracking more fields than ADS is giving us.
     *        For scenarios within the LDS Records Module, if we have fetched a fresh value from the server and if it's a root record, there is no need for a
     *        merge because LDS should have retrieved all necessary fields.
     * @param isRoot Whether the existingRecord and newNormalizedRecord are root records (true) or nested spanning records (false).
     * @param resolveRootMerge true if during merge for a root record we should accept the record even if it has fewer fields than the existing record.
     * @returns The merged record.
     */function _mergeRecord(existingNormalizedRecord,newNormalizedRecord,rootRecordMerge,isRoot,resolveRootMerge){// cannot merge record with different id
    if(existingNormalizedRecord.id!==newNormalizedRecord.id||existingNormalizedRecord.apiName!==newNormalizedRecord.apiName){throw new Error("Id or API Name cannot be different for merging records.");}const newNormalizedRecordContainsAllFieldsOfExistingNormalizedRecord=_secondRecordContainsAllFieldsInFirstRecord(existingNormalizedRecord,newNormalizedRecord);// For scenarios within the LDS Records Module, if we fetched a fresh value from the server and if it's a root record:
    // If all existing fields are in newRecord there is no need to merge and so return the newNormalizedRecord
    // If all existing fields are not in newRecord but this was obtained with resolveRootMerge true, then accept the new record.
    if(!rootRecordMerge&&isRoot&&(newNormalizedRecordContainsAllFieldsOfExistingNormalizedRecord||resolveRootMerge)){return newNormalizedRecord;}const systemModstampsAreDifferent=recordServiceUtils.systemModstampsAreDifferent(newNormalizedRecord,existingNormalizedRecord);if(!systemModstampsAreDifferent){// if systemModstamps are same, then we can merge the 2 records
    const mergedRecord=clone(existingNormalizedRecord,recordServiceUtils.getRecordCacheKey(existingNormalizedRecord));recordServiceUtils.deepRecordCopy(newNormalizedRecord,mergedRecord);return mergedRecord;}// systemModstamps are different
    if(newNormalizedRecordContainsAllFieldsOfExistingNormalizedRecord){// systemModstamps are different and the second record has all fields contained in the first record
    // so no need to merge. return the fresh record
    return newNormalizedRecord;}// systemModstamps are different but the second record does not have all fields contained in the first record
    // so it's a merge conflict and before we queue a fresh request, merge the records and store the mergedRecord in a map
    // which may be(scenario is when we detect that the marker has more fields listed than what we have committed in cache) utilized when we denormalize records
    // See W-5302879 for more details.
    const conflictMergedRecord=clone(existingNormalizedRecord,recordServiceUtils.getRecordCacheKey(existingNormalizedRecord));recordServiceUtils.deepRecordCopy(newNormalizedRecord,conflictMergedRecord);// @ts-ignore TODO: remove the ts-ignore when this method gets moved into the class as a private method.
    this._mergeConflictRecordsMap.set(newNormalizedRecord.id,conflictMergedRecord);// queue a fresh request for the conflicted record as a root record with all the tracked fields.
    const objectApiName=newNormalizedRecord.apiName;// check and log if we are making a server call for unsupported UI API entity
    if(!recordServiceUtils.isSupportedEntity(objectApiName)){this._ldsCache.instrumentation.logError({message:`Merge conflict for Unsupported entity: ${objectApiName}`},"LDS.recordService.mergeConflict",InstrumentationErrorType.WARN);}// for unsupported UI API entities don't send xhr as it is going to fail
    // @ts-ignore
    if(this._unsupportedEntitiesSet.has(objectApiName)){return newNormalizedRecord;}const allFieldNamesSet=new UsefulSet();// if we reached here it means that fields are not same for records and SystemModstamp is different/not present then re-fetch it with all the fields
    const trackedRecordFields=this.getFieldsForRecord(existingNormalizedRecord.id);_gatherFieldNamesFromNormalizedRecord(newNormalizedRecord,allFieldNamesSet);_gatherFieldNamesFromNormalizedRecord(existingNormalizedRecord,allFieldNamesSet);trackedRecordFields.addAll(allFieldNamesSet);// evict existing entry and send the request with allFields
    const trackedRecordFieldsArray=collectionToArray(trackedRecordFields);const refreshRecordFields=this.getADSFieldsForRecord(existingNormalizedRecord.id);// Add in fields that ADS has requested but LDS is not interested in.
    if(refreshRecordFields){const refreshFields=collectionToArray(refreshRecordFields.difference(trackedRecordFieldsArray));for(let len=refreshFields.length,n=0;n<len;n++){trackedRecordFieldsArray.push(refreshFields[n]);}}const cacheKey=new RecordCacheKeyBuilder().setRecordId(existingNormalizedRecord.id).build();const recordValueProviderParams={cacheKey,recordId:existingNormalizedRecord.id,optionalFields:trackedRecordFieldsArray,forceProvide:true,rootRecordMerge:false,informRecordLib:true,resolveRootMerge:true};const valueProvider=this._createRecordValueProvider(recordValueProviderParams,()=>{return false;// value provider's equal function specifically returning false so that we make a server call
    });this._privateGetRecordWithFields(existingNormalizedRecord.id,[],trackedRecordFieldsArray,valueProvider,false,true);return;}/**
     * Constructs an Observable that will emit a record with only those fields given by the requiredFields and optionalFields parameters.
     * If a required field is missing during an emit attempt, an error will be emitted. If an optional field is missing then it will be ignored.
     * @param filteredRecordCacheKey The filtered record key identifying the filtered observable.
     * @param observableToFilter The observable that emits a record object that we want to filter down the fields on.
     * @param requiredFields The list of required fields to remain in the record.
     * @param optionalFields The list of optional fields to remain in the record.
     * @param requestOnlyHasTrackedFields check if the request has tracked fields only
     * @returns An observable the emits a record with a filtered fields list.
     */function _constructFilteredObservable(filteredRecordCacheKey,observableToFilter,requiredFields,optionalFields,requestOnlyHasTrackedFields){let filteredObservable=observableToFilter;// root observable
    // If this request has previously untracked fields then we need to wait for the refresh to come back before allowing
    // emits through. This is necessary because we don't want the field filter to throw an error until it is
    // acting on the fresh value that contains the new fields.
    if(!requestOnlyHasTrackedFields){filteredObservable=filteredObservable.skipWhile(valueWrapper=>{const recordId=valueWrapper.value.id;return this._recordIdsToIsRefreshingMap.has(recordId);});}filteredObservable=filteredObservable.map(valueWrapper=>{const value=valueWrapper.value;// Transform the record into a record that only contains the fields requested.
    const fullFieldsList=_getFullFieldsListForFilteredObservable(value,requiredFields,optionalFields);const newFilteredRecord=recordServiceUtils.createFilteredRecordFromRecord(value,fullFieldsList);return ValueWrapper.cloneWithValueOverride(valueWrapper,newFilteredRecord);}).distinctUntilChanged((previousValue,newValue)=>{if(previousValue===undefined){return false;}// Only allow new values to be emitted.
    return equivalent(previousValue.value,newValue.value);}).mapWithFilterOnSubscribeBehaviorSubject(value=>{let shouldEmit=false;if(this._ldsCache.timeSource.now()<value.lastFetchTime+this.getCacheValueTtl()){shouldEmit=true;}else{// TTL expired
    lastValueTracker.add(value);}return shouldEmit;},valueWrapper=>{return toReadOnly(valueWrapper.value);});// Subscribe to the new filtered observable so that when it completes (or errors) we know to remove the filtered observable from the map.
    const errorCompleteSubscription=filteredObservable.subscribe(new Observer(()=>{return;},()=>{this._filteredObservables.delete(filteredRecordCacheKey.getKey());}),()=>{this._filteredObservables.delete(filteredRecordCacheKey.getKey());});// Decorate the subscribe method to return a Subscription instance with a decorated unsubscribe method which will dispose the filtered observable if
    // the subscriptions count drops below 1. (Not 0 because of the above subscription which will always be there but doesn't signify that
    // there is someone interested in this filtered observable externally.
    const recordServiceFilteredObservables=this._filteredObservables;const originalSubscribeFn=filteredObservable.subscribe;filteredObservable.subscribe=(observer,...args)=>{const originalSubscription=originalSubscribeFn.call(filteredObservable,observer,...args);const originalSubscriptionUnsubscribeFn=originalSubscription.unsubscribe;originalSubscription.unsubscribe=()=>{originalSubscriptionUnsubscribeFn.call(originalSubscription);if(filteredObservable.subscriptions.size<=1){if(errorCompleteSubscription&&!errorCompleteSubscription.closed){errorCompleteSubscription.unsubscribe();}recordServiceFilteredObservables.delete(filteredRecordCacheKey.getKey());}};return originalSubscription;};return filteredObservable;}/**
     * Produces a list of all the fields to remain in the record. Will throw an error if a required field is missing. Ignores missing optional fields.
     * @param record The record object which has all fields.
     * @param requiredFields The list of required fields to remain in the record.
     * @param optionalFields The list of optional fields to remain in the record.
     * @returns A list of unqualified fields to remain in the record.
     */function _getFullFieldsListForFilteredObservable(record,requiredFields,optionalFields){const apiNameLength=record.apiName.length+1;// +1 for the '.'
    const unqualifiedRequiredFields=requiredFields.map(field=>{if(recordServiceUtils.getFieldValue(record,field)===undefined){if(field.startsWith(record.apiName+".")){throw getLdsInternalError("INVALID_FIELD",`No such column '${field.substring(apiNameLength)}' on entity '${record.apiName}'. If you are attempting to use a custom field, be sure to append the '__c' after the custom field name. Please reference your WSDL or the describe call for the appropriate names.`,true);}throw getLdsInternalError("INVALID_FIELD",`Entity name for the provided record didn't match required field ${field}`,true);}return field.substring(apiNameLength);});const unqualifiedOptionalFields=optionalFields.filter(field=>field.startsWith(record.apiName)).map(field=>field.substring(apiNameLength));return unqualifiedRequiredFields.concat(unqualifiedOptionalFields);}/**
     * Executes the global aura controller request. Tracks active requests by record id.
     * @param recordId The record id pertaining to the request.
     * @param controllerName The name of the global controller to execute.
     * @param parameters An object map containing the parameters of the request.
     * @returns TransportResponse from the server
     */async function _makeServerCall(recordId,controllerName,parameters,wireName){const _recordIdsToIsRefreshingMap=this._recordIdsToIsRefreshingMap;if(recordId){let refreshingCount=_recordIdsToIsRefreshingMap.get(recordId);if(refreshingCount===undefined){refreshingCount=1;}else{refreshingCount+=1;}_recordIdsToIsRefreshingMap.set(recordId,refreshingCount);}let result;if(transportUtils.useAggregateUi&&wireName){result=await transportUtils.executeAuraGlobalControllerAggregateUi(wireName,parameters,RECORD_TTL);}else{result=await executeAuraGlobalController(controllerName,parameters);}if(recordId){let refreshingCount=_recordIdsToIsRefreshingMap.get(recordId);if(refreshingCount===undefined||refreshingCount===1){_recordIdsToIsRefreshingMap.delete(recordId);}else{refreshingCount-=1;_recordIdsToIsRefreshingMap.set(recordId,refreshingCount);}}return result;}/**
     * Utility functions for resolving records out of record markers.
     *
     * These methods must be separate from record-marker-utils.js because they call into record-service,
     * which calls into record-marker-utils.
     */class RecordMarkerResolver{/**
         * Given a marker representing a normalized record value, this returns a Thenable that resolves to the denormalized record. This is intended
         * to be used during denormalization.
         * @param recordService The recordService instance.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param recordMarker The record marker representing a normalized record.
         * @returns Thenable that resolves to the denormalized record.
         */fromRecordMarker(recordService,cacheAccessor,recordMarker){const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordMarker.id).build();return cacheAccessor.get(cacheKey).then(normalizedRecordValueWrapper=>{if(!normalizedRecordValueWrapper){return Thenable.resolve(undefined);}const markerFieldNames=recordMarkerUtils.getUnqualifiedFieldNamesFromRecordMarker(recordMarker);const denormalizedRecordThenable=recordService.denormalizeRecord(normalizedRecordValueWrapper.value,cacheAccessor,recordMarker.depth).then(denormalizedRecord=>{return recordServiceUtils.createFilteredRecordFromRecord(denormalizedRecord,markerFieldNames);});return denormalizedRecordThenable;});}/**
         * Given an array of markers representing normalized record values, this returns a Thenable that resolves to an array of the denormalized records.
         * This is intended to be used during denormalization, and is preferred over simply iterating over fromRecordMarker() because it can do some
         * optimizations like only denormalizing a given record once.
         * @param recordService The recordService instance.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param recordMarkerArray The record marker representing a normalized record.
         * @returns a Thenable that resolves to an array of the denormalized records.
         */fromRecordMarkers(recordService,cacheAccessor,recordMarkerArray){const thenables=[];const markersMap=new Map();// Figure out how deep we have to denorm each record, accounting for the fact that it could show up more than
    // once in the list. Store everything in a map so we dedup the records we need to denorm.
    for(let c=0;c<recordMarkerArray.length;++c){const recordMarker=recordMarkerArray[c];const recordId=recordMarker.id;const lastMarker=markersMap.get(recordId);if(lastMarker===undefined){markersMap.set(recordMarker.id,recordMarker);}else if(recordMarker.depth<lastMarker.depth){markersMap.set(recordMarker.id,recordMarker);}}for(const value of markersMap.values()){thenables.push(this.fromRecordMarker(recordService,cacheAccessor,value));}return Thenable.all(thenables).then(denormalizedRecordsArray=>{const denormalizedRecordsMap=new Map();const finalDenormalizedRecordsArray=[];// Re-index the denormalized records into a map.
    for(let c=0;c<denormalizedRecordsArray.length;++c){const denormalizedRecord=denormalizedRecordsArray[c];denormalizedRecordsMap.set(denormalizedRecord.id,denormalizedRecord);}// Pluck the records out of the map and put them back in the same order as the original recordMarkerArray.
    for(let c=0;c<recordMarkerArray.length;++c){const recordMarker=recordMarkerArray[c];finalDenormalizedRecordsArray.push(denormalizedRecordsMap.get(recordMarker.id));}return finalDenormalizedRecordsArray;});}}/**
     * RecordMarkerResolver - The singleton instance of the class.
     */const recordMarkerResolver=new RecordMarkerResolver();/**
     * Wire adapter id: getRecord.
     * @throws Error Always throws when invoked. Imperative invocation is not supported.
     * @returns void
     */function getRecord(){throw generateError("getRecord");}/*
     * Singleton class which contains the wire adapter ids and wire adapter functions for servicing
     * @wires in the lds-records module. Handles registering the wire adapters with the wire service.
     */class RecordWireAdapterGenerator{/**
         * Constructor.
         * @param recordService Reference to the RecordService instance.
         */constructor(recordService){this._recordService=recordService;}/*
         * Generates the wire adapter for getRecord.
         * @returns WireAdapter - See description.
         */generateGetRecordWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetRecord.bind(this));return wireAdapter;}/**
         * @private
         * Service getRecord @wire.
         * @param config Config params for the service.
         * @param metaConfig WireRefreshMetaConfig to refresh the cache from System of Records (SOR)
         * @return Observable stream that emits a record object.
         */serviceGetRecord(config,metaConfig){if(!config){return undefined;}{const required=["recordId"];const oneof=["fields","optionalFields","layoutTypes"];const supported=["childRelationships","fields","layoutTypes","modes","optionalFields","pageSize","recordId"];const unsupported=["childRelationships","pageSize"];// TODO W-4421501, W-4045854
    validateConfig("getRecord",config,required,supported,unsupported,oneof);}if(!config.recordId){return undefined;}const recordId=to18(config.recordId);if(config.layoutTypes){return this._recordService.getRecordWithLayouts(recordId,config.layoutTypes,config.modes,config.optionalFields);}else{if(!config.fields&&!config.optionalFields){return undefined;}if(metaConfig){return this._recordService.getRecordWithFieldsWithMetaConfig(recordId,config.fields,config.optionalFields,metaConfig);}return this._recordService.getRecordWithFields(recordId,config.fields,config.optionalFields);}}}/**
     * Constructs a cache key for the RecordUi value type. Keys are constructed from:
     * - recordIds
     * - layoutTypes
     * - modes
     * - optionalFields
     */class RecordUiCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(RECORD_UI_VALUE_TYPE);}/**
         * Sets the recordIds for the cache key.
         * @param recordIds The record ids.
         * @returns The current object. Useful for chaining method calls.
         */setRecordIds(recordIds){this._recordIds=recordIds.sort();return this;}/**
         * @returns The record ids for the cache key.
         */getRecordIds(){return this._recordIds;}/**
         * Sets the layoutTypes for the cache key.
         * @param layoutTypes The layout types.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutTypes(layoutTypes){this._layoutTypes=layoutTypes.map(type=>type.toLowerCase()).sort();return this;}/**
         * @returns The layout types for the cache key.
         */getLayoutTypes(){return this._layoutTypes;}/**
         * Sets the modes for the cache key.
         * @param modes: The modes.
         * @returns The current object. Useful for chaining method calls.
         */setModes(modes){this._modes=modes.map(mode=>mode.toLowerCase()).sort();return this;}/**
         * @returns The modes for the cache key.
         */getModes(){return this._modes;}/**
         * Sets the optionalFields for the cache key.
         * @param optionalFields The list of optional fields.
         * @returns The current object. Useful for chaining method calls.
         */setOptionalFields(optionalFields){this._optionalFields=optionalFields.sort();return this;}/**
         * @returns The optional fields for the cache key.
         */getOptionalFields(){return this._optionalFields;}/**
         * Builds the cache key.
         * @returns A new cache key representing the RecordUi value type.
         */build(){function errorFormatter(literals,key,valueFound,singleValue){let base=`${key} should be a string list, but received ${valueFound}`;if(singleValue){base+=`, list contains an entry with value ${singleValue}`;}return base;}function constructKeyFromStringList(list,key){{list.forEach(field=>{assert$1(field,errorFormatter`${key}${list}${field}`);});}return list.join(",");}{assert$1(this._recordIds.length,"Non-empty recordIds must be provided.");assert$1(this._layoutTypes.length,"Non-empty layoutTypes must be provided.");assert$1(this._modes.length,"Non-empty modes must be provided.");}const recordIds=constructKeyFromStringList(this._recordIds,"recordIds");const layoutTypes=constructKeyFromStringList(this._layoutTypes,"layoutTypes");const modes=constructKeyFromStringList(this._modes,"modes");const optionalFields=constructKeyFromStringList(this._optionalFields?this._optionalFields:[],"optionalFields");return new CacheKey(this.getValueType(),`${recordIds}${KEY_DELIM}${layoutTypes}${KEY_DELIM}${modes}${KEY_DELIM}${optionalFields}`);}/**
         * Returns a RecordUiCacheKeyBuilder based on a keyString. Throws an error if it can't be done because a bad string is provided.
         * @param keyString A cache key string derived from a RecordUi CacheKey.
         * @returns A RecordUiCacheKeyBuilder based on a keyString. Throws an error if it can't be done because a bad string is provided.
         */static fromKeyString(keyString){return RecordUiCacheKeyBuilder.fromCacheKey(CacheKey.parse(keyString));}/**
         * Returns a RecordUiCacheKeyBuilder based on a keyString. Throws an error if it can't be done because a bad string is provided.
         * @param keyString A cache key string derived from a RecordUi CacheKey.
         * @returns A RecordUiCacheKeyBuilder based on a keyString.
         */static fromCacheKey(cacheKey){{assert$1(cacheKey.getValueType()===RECORD_UI_VALUE_TYPE,`valueType was expected to be RECORD_UI_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);const builder=new RecordUiCacheKeyBuilder();builder.setRecordIds(localKeyParts[0].split(","));if(localKeyParts.length>1){const layoutTypes=localKeyParts[1]===""?[]:localKeyParts[1].split(",");builder.setLayoutTypes(layoutTypes);}if(localKeyParts.length>2){const modes=localKeyParts[2]===""?[]:localKeyParts[2].split(",");builder.setModes(modes);}if(localKeyParts.length>3){const optionalFields=localKeyParts[3]===""?[]:localKeyParts[3].split(",");builder.setOptionalFields(optionalFields);}return builder;}/**
         * @param recordUi The recordUi from which to create a builder.
         * @returns A RecordUiCacheKeyBuilder based on the given recordUi.
         */static fromRecordUi(recordUi){const extracted={layoutTypes:{},modes:{}};Object.keys(recordUi.layouts).forEach(apiName=>{const recordTypeIds=recordUi.layouts[apiName];Object.keys(recordTypeIds).forEach(recordTypeId=>{const layouts=recordTypeIds[recordTypeId];Object.assign(extracted.layoutTypes,layouts);Object.keys(layouts).forEach(layout=>{const modes=layouts[layout];Object.assign(extracted.modes,modes);});});});const builder=new RecordUiCacheKeyBuilder();builder.setRecordIds(Object.keys(recordUi.records));builder.setLayoutTypes(Object.keys(extracted.layoutTypes));builder.setModes(Object.keys(extracted.modes));return builder;}}/**
     * The valueType to use when building LayoutCacheKeyBuilder.
     */const LAYOUT_USER_STATE_VALUE_TYPE="uiapi.RecordLayoutUserStateRepresentation";/**
     * Time to live for a layout user state cache value. 15 minutes.
     */const LAYOUT_USER_STATE_TTL=15*60*1000;/**
     * Constructs a cache key for the Layout value type. Keys are constructed from:
     * - objectApiName
     * - recordTypeId
     * - layoutType
     * - mode
     *
     * Layout cache key is used as cache key for layout data provided by UI API.
     * So, LayoutCacheKeyBuilder doesn't support as many layout key params as recordlibrary currently uses,
     * because recordlibrary supports more layout types than UI API supports. Example: List, Related List layout.
     */class LayoutUserStateCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(LAYOUT_USER_STATE_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name with which the layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName.toLowerCase();return this;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The record type id with which the layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this.recordTypeId=recordTypeId;return this;}/**
         * Sets the layoutType for the cache key.
         * @param layoutType The layout type with which the layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this.layoutType=layoutType.toLowerCase();return this;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this.mode=mode.toLowerCase();return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the Layout value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");assert$1(this.recordTypeId,"recordTypeId must be defined.");assert$1(this.layoutType,"A non-empty layoutType must be provided.");assert$1(this.mode,"A non-empty mode must be provided.");assert$1(this.recordTypeId.length===18,"Record Type Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this.objectApiName}${KEY_DELIM}${this.recordTypeId}${KEY_DELIM}${this.layoutType}${KEY_DELIM}${this.mode}`);}}/**
     * Provides functionality to read layout data from the cache. Can refresh the data from the server.
     */class LayoutUserStateService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[LAYOUT_USER_STATE_VALUE_TYPE]);}getCacheValueTtl(){return LAYOUT_USER_STATE_TTL;}/**
         * Gets a layout user state.
         * @param objectApiName Object API name of the layout to retrieve.
         * @param recordTypeId Record type id of the layout to retrieve.
         * @param layoutType Type of layout to retrieve.
         * @param mode Layout mode to retrieve.
         * @returns An observable of the layout user state.
         */getLayoutUserState(objectApiName,recordTypeId,layoutType,mode){objectApiName=getObjectApiName(objectApiName);recordTypeId=to18(recordTypeId);const cacheKey=new LayoutUserStateCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).setLayoutType(layoutType).setMode(mode).build();const valueProviderParameters={cacheKey,objectApiName,recordTypeId,layoutType,mode};const valueProvider=this._createLayoutUserStateValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Stage puts the given layoutUserState.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param layoutUserState The layoutUserState value to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData Property bag that contains additional values needed for generating the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,layoutUserState,cacheAccessor,additionalData){const layoutUserStateCacheKey=new LayoutUserStateCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).setLayoutType(additionalData.layoutType).setMode(additionalData.mode).build();cacheAccessor.stagePut(dependentCacheKeys,layoutUserStateCacheKey,layoutUserState,layoutUserState);return ThenableFactory.resolve(undefined);}/**
         * There are no eTags to strip from layout user state so just return the given value unchanged.
         * @param layoutUserState
         * @returns The given layoutUserState unchanged.
         */stripETagsFromValue(layoutUserState){return layoutUserState;}/**
         * Updates the layout user state associated with the given parameters.
         * NOTE: This is a WRITE-BEHIND style update.
         * @param objectApiName The object api name associated with the layout user state.
         * @param recordTypeId The record type id associated with the layout user state.
         * @param layoutType The layout type associated with the layout user state.
         * @param mode The mode associated with the layout user state.
         * @param layoutUserStateInput Input specifying how to change the layoutUserState. Of the shape:
         *      {
         *          sectionUserStates: {
         *              sectionId1: {
         *                  collapsed: true
         *              }
         *              ...
         *          }
         *      }
         * @return A Promise resolved to the new layoutUserState value.
         */async updateLayoutUserState(objectApiName,recordTypeId,layoutType,mode,layoutUserStateInput){objectApiName=getObjectApiName(objectApiName);// Use the existing cache value and mutate it based on the given layoutUserStateInput. We do this so we can do an optimistic client side update so changes get
    // propagated immediately instead of having to wait on a server call. An optimistic update is only possible if all the sectionUserState ids exist in the cache value.
    let doOptimisticUpdate=true;const cachedLayoutUserState=await observableToPromise(this.getLayoutUserState(objectApiName,recordTypeId,layoutType,mode),true);const updatedLayoutUserState=cloneDeepCopy(cachedLayoutUserState,false);Object.keys(layoutUserStateInput.sectionUserStates).forEach(sectionId=>{if(!cachedLayoutUserState.sectionUserStates[sectionId]){// They are trying to update a section that isn't in the cached value so cancel the optimistic update.
    doOptimisticUpdate=false;}else{updatedLayoutUserState.sectionUserStates[sectionId].collapsed=layoutUserStateInput.sectionUserStates[sectionId].collapsed;}});const layoutUserStateCacheKey=new LayoutUserStateCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).setLayoutType(layoutType).setMode(mode).build();if(doOptimisticUpdate){// Do an optimistic update to the client cache so state will update immediately on the client.
    const valueProviderParameters={cacheKey:layoutUserStateCacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState:updatedLayoutUserState,forceProvide:true};const valueProvider=this._createLayoutUserStateValueProvider(valueProviderParameters);await observableToPromise(this._ldsCache.get(layoutUserStateCacheKey,valueProvider),true);}// Persist the state to the server.
    const apiParameters={objectApiName,recordTypeId,layoutType,mode,userState:layoutUserStateInput};executeAuraGlobalController("RecordUiController.updateLayoutUserState",apiParameters);return updatedLayoutUserState;}/**
         * Constructs a value provider to retrieve a user's layout state.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve a user's layout state.
         */_createLayoutUserStateValueProvider(valueProviderParameters){const{cacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState,forceProvide}=valueProviderParameters;const valueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+LAYOUT_USER_STATE_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState);});},valueProviderParameters);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the layoutUserState.
         * @param objectApiName The objectApiName of the layoutUserState.
         * @param recordTypeId The recordTypeId of the layoutUserState.
         * @param layoutType The layoutType of the layoutUserState.
         * @param mode The mode of the layoutUserState.
         * @param localFreshLayoutUserState Optional. A layoutUserState value you want explicitly put into cache instead of getting the value from the server.
         * @returns Returns a string representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,layoutType,mode,localFreshLayoutUserState){let layoutUserStateThenable=null;// If the layoutUserState is provided, we don't go to server to fetch it.
    if(localFreshLayoutUserState){layoutUserStateThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshLayoutUserState));}else{const params={objectApiName,recordTypeId,layoutType,mode};if(transportUtils.useAggregateUi){layoutUserStateThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getLayoutUserState",params,LAYOUT_USER_STATE_TTL);}else{layoutUserStateThenable=executeAuraGlobalController("RecordUiController.getLayoutUserState",params);}}return layoutUserStateThenable.then(transportResponse=>{// Cache miss.
    const freshLayoutUserState=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);// Nothing should depend on this yet; included for completeness.
    this.stagePutValue([],freshLayoutUserState,cacheAccessor,{objectApiName,recordTypeId,layoutType,mode});}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Cache value marker for layout user state.
     */class LayoutUserStateCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param objectApiName The objectApiName for the marker.
         * @param recordTypeId The recordTypeId for the marker.
         * @param layoutType The layoutType for the marker.
         * @param mode The mode for the marker.
         */constructor(timestamp,objectApiName,recordTypeId,layoutType,mode){super(timestamp);this.objectApiName=objectApiName;this.recordTypeId=recordTypeId;this.layoutType=layoutType;this.mode=mode;}}/**
     * Constructs a LayoutUserStateCacheValueMarker.
     */class LayoutUserStateCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The recordTypeId.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * Sets the layoutType for the marker.
         * @param layoutType The layoutType.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this._layoutType=layoutType;return this;}/**
         * Sets the mode for the marker.
         * @param mode The mode.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode;return this;}/**
         * Builds the LayoutUserStateCacheValueMarker.
         * @returns A new LayoutUserStateCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._objectApiName,"A non-empty objectApiName must be set.");assert$1(this._recordTypeId,"A non-empty recordTypeId must be set.");assert$1(this._layoutType,"A non-empty layoutType must be set.");assert$1(this._mode,"A non-empty mode must be set.");}return new LayoutUserStateCacheValueMarker(this._timestamp,this._objectApiName,this._recordTypeId,this._layoutType,this._mode);}}const{isMarker}=cacheValueMarkerUtils;/**
     * Provides functionality to read record ui data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for this value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class RecordUiService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param adsBridge Reference to the AdsBridge instance.
         */constructor(ldsCache,adsBridge){super(ldsCache,[RECORD_UI_VALUE_TYPE]);this._adsBridge=adsBridge;}getCacheValueTtl(){return RECORD_UI_TTL;}/**
         * Gets a record UI.
         * @param recordIds Id of the records to retrieve.
         * @param layoutTypes Layouts defining the fields to retrieve.
         * @param modes Layout modes defining the fields to retrieve.
         * @param optionalFields Qualified field API names to retrieve. If any are inaccessible then they are silently omitted.
         * @returns An observable of record values.
         */getRecordUi(recordIds,layoutTypes,modes,optionalFields){recordIds=recordIds.map(id=>to18(id));const processedOptionalFields=(optionalFields||[]).map(getFieldApiName);const uniqueOptionalFields=collectionToArray(new UsefulSet(processedOptionalFields));const cacheKey=new RecordUiCacheKeyBuilder().setRecordIds(recordIds).setLayoutTypes(layoutTypes).setModes(modes).setOptionalFields(uniqueOptionalFields).build();const recordUiValueProviderParams={cacheKey,recordIds,layoutTypes,modes,optionalFields:uniqueOptionalFields,forceProvide:false};const valueProvider=this._createRecordUiValueProvider(recordUiValueProviderParams);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Helper method to kick off a refresh for a Record UI.
         * @param affectedKey The cache key for the recordUi to refresh.
         */refreshRecordUi(affectedKey){// When a record type changes in a record it can affect the layouts that should be present in the RecordUi. Because of this for now we
    // do a full refresh of the RecordUi.
    const keyBuilder=RecordUiCacheKeyBuilder.fromCacheKey(affectedKey);const recordIds=keyBuilder.getRecordIds();const layoutTypes=keyBuilder.getLayoutTypes();const modes=keyBuilder.getModes();const adjustedOptionalFields=keyBuilder.getOptionalFields();// We need to refresh, but we're already in a cache transaction. Kick this to a Promise to get this out of the cache operation we're
    // already in the middle of.
    Promise.resolve().then(()=>{const forceProvide=true;// Use _createRecordUiValueProvider() instead of getRecordUi() so we can force value providing.
    const recordUiValueProviderParams={cacheKey:affectedKey,recordIds,layoutTypes,modes,optionalFields:adjustedOptionalFields,forceProvide};const valueProvider=this._createRecordUiValueProvider(recordUiValueProviderParams);this._ldsCache.get(affectedKey,valueProvider);});}/**
         * Stage puts the given recordUi.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param recordUi The recordUi to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that determine how normalization occurs.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,recordUi,cacheAccessor,additionalData){// Defaults.
    additionalData=additionalData?additionalData:{rootRecordMerge:true};// fetch parameters from recordUi json and build cache key
    const recordUiCacheKeyBuilder=RecordUiCacheKeyBuilder.fromRecordUi(recordUi);const recordUiCacheKey=new RecordUiCacheKeyBuilder().setRecordIds(recordUiCacheKeyBuilder.getRecordIds()).setLayoutTypes(recordUiCacheKeyBuilder.getLayoutTypes()).setModes(recordUiCacheKeyBuilder.getModes()).build();return this._normalizeAndStagePutRecordUi(dependentCacheKeys,recordUi,cacheAccessor,recordUiCacheKey,additionalData.rootRecordMerge).then(()=>{return;});}/**
         * Caches a record ui. Use this when you want to put a record ui into the cache that you already have locally.
         * @param recordUiCacheKey The cache key for the record ui to cache.
         * @param recordUi The denormalized record ui object to cache.
         * @param rootRecordMerge True if we should attempt to merge the root record during normalization. This should only happen from ADS bridge
         *      code paths. If this request originated from LDS, then we know the record has all the fields we are interested in and is the freshest version.
         * @returns Returns an observable that emits values for the given cache key.
         */cacheRecordUi(recordUiCacheKey,recordUi,rootRecordMerge){rootRecordMerge=rootRecordMerge===true;const recordUiCacheKeyBuilder=RecordUiCacheKeyBuilder.fromCacheKey(recordUiCacheKey);const recordIds=recordUiCacheKeyBuilder.getRecordIds();const layoutTypes=recordUiCacheKeyBuilder.getLayoutTypes();const modes=recordUiCacheKeyBuilder.getModes();const optionalFields=recordUiCacheKeyBuilder.getOptionalFields();const forceProvide=true;const recordUiValueProviderParams={cacheKey:recordUiCacheKey,recordIds,layoutTypes,modes,optionalFields,forceProvide,localFreshRecordUi:recordUi,rootRecordMerge};const valueProvider=this._createRecordUiValueProvider(recordUiValueProviderParams);const observable=this._ldsCache.get(recordUiCacheKey,valueProvider);return observable;}/**
         * Strips all eTag properties from the given recordUi by directly deleting them.
         * @param recordUi The recordUi from which to strip the eTags.
         * @returns The given recordUi with its eTags stripped.
         */stripETagsFromValue(recordUi){delete recordUi.eTag;// Strip eTags from object infos.
    const objectInfos=recordUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;++n){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];objectInfos[objectApiName]=this._ldsCache.stripETagsFromValue(OBJECT_INFO_VALUE_TYPE,objectInfo);}// Strip eTags from layouts.
    const layouts=recordUi.layouts;const layoutObjectApiNames=Object.keys(layouts);for(let len=layoutObjectApiNames.length,layoutObjectApiNameIndex=0;layoutObjectApiNameIndex<len;++layoutObjectApiNameIndex){const objectApiName=layoutObjectApiNames[layoutObjectApiNameIndex];const layoutsUnderObjectApiNames=recordUi.layouts[objectApiName];const recordTypeIds=Object.keys(layoutsUnderObjectApiNames);for(let recordTypeIdsLen=recordTypeIds.length,recordTypeIdIndex=0;recordTypeIdIndex<recordTypeIdsLen;++recordTypeIdIndex){const recordTypeId=recordTypeIds[recordTypeIdIndex];const layoutsUnderRecordTypeIds=layoutsUnderObjectApiNames[recordTypeId];const layoutTypes=Object.keys(layoutsUnderRecordTypeIds);for(let layoutTypesLen=layoutTypes.length,layoutTypeIndex=0;layoutTypeIndex<layoutTypesLen;++layoutTypeIndex){const layoutType=layoutTypes[layoutTypeIndex];const layoutsUnderLayoutTypes=layoutsUnderRecordTypeIds[layoutType];const modes=Object.keys(layoutsUnderLayoutTypes);for(let modeLength=modes.length,modeIndex=0;modeIndex<modeLength;++modeIndex){const mode=modes[modeIndex];const layout=layoutsUnderLayoutTypes[mode];layoutsUnderLayoutTypes[mode]=this._ldsCache.stripETagsFromValue(LAYOUT_VALUE_TYPE,layout);}}}}// Strip eTags from records.
    const records=recordUi.records;const recordIds=Object.keys(records);for(let n=0,len=recordIds.length;n<len;++n){const recordId=recordIds[n];const record=records[recordId];this._ldsCache.stripETagsFromValue(RECORD_VALUE_TYPE,record);}return recordUi;}getAffectedKeyHandler(){return (affectedKey,cacheAccessor)=>{{assert$1(affectedKey.getValueType()===RECORD_UI_VALUE_TYPE,`Expected RECORD_UI_VALUE_TYPE value type for RecordUi: ${affectedKey.getValueType().toString()}`);}// We need to detect if any of the records' record types have changed. If they have, we must fully refresh this RecordInfo. If not, we
    // can just denorm and stage an emit for it.
    return cacheAccessor.get(affectedKey).then(recordUiWrapper=>{let refreshRecordUi=false;if(recordUiWrapper){const normalizedRecordUi=recordUiWrapper.value;const recordMarkers=normalizedRecordUi.records;const recordIds=Object.keys(recordMarkers);for(let c=0,len=recordIds.length;c<len;++c){const recordId=recordIds[c];const recordMarker=recordMarkers[recordId];{assert$1(recordMarker&&isMarker(recordMarker),`Expected to find a marker for record ${recordId} but instead found ${recordMarker}`);}const recordMarkerRecordTypeId=recordMarker.recordTypeId;const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const refreshedRecordValueWrapper=cacheAccessor.getCommitted(recordCacheKey);if(refreshedRecordValueWrapper){// TODO: Make this type a NormalizedRecord when RecordService is converted to typescript!
    const refreshedRecord=refreshedRecordValueWrapper.value;// A record matching this marker has been committed as part of this cache transaction. See if its record type changed.
    // If it did we need to do a full refresh of this RecordUi, otherwise we can just denorm/emit it. We don't need to
    // worry about records that weren't committed as part of this cache transaction because they haven't changed.
    // We use null rather than undefined here to be consistent with what we'll find in the API JSON payloads.
    const refreshedRecordTypeId=refreshedRecord.recordTypeInfo?refreshedRecord.recordTypeInfo.recordTypeId:null;if(recordMarkerRecordTypeId!==refreshedRecordTypeId){refreshRecordUi=true;break;}}}// Maybe an ObjectInfo changed, if so determining its effect could be difficult so do a full refresh to be sure we get it right.
    if(!refreshRecordUi){// Don't make further checks if we don't need to.
    const objectInfoMarkers=normalizedRecordUi.objectInfos;const objectApiNames=Object.keys(objectInfoMarkers);for(let c=0,len=objectApiNames.length;c<len;++c){const objectApiName=objectApiNames[c];const objectInfoMarker=objectInfoMarkers[objectApiName];const objectInfoETag=objectInfoMarker.eTag;const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();const refreshedObjectInfoValueWrapper=cacheAccessor.getCommitted(objectInfoCacheKey);if(refreshedObjectInfoValueWrapper){if(objectInfoETag!==refreshedObjectInfoValueWrapper.eTag){refreshRecordUi=true;break;}}}}}if(refreshRecordUi){return this.refreshRecordUi(affectedKey);}// A full refresh is unnecessary -- just do denorm and staging of an emit.
    cacheAccessor.get(affectedKey).then(normalizedRecordUiValueWrapper=>{if(normalizedRecordUiValueWrapper){this._denormalizeRecordUi(normalizedRecordUiValueWrapper.value,cacheAccessor).then(recordUi=>{// Denorm was successful
    if(recordUi){const recordUiValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(normalizedRecordUiValueWrapper,recordUi);cacheAccessor.stageEmit(affectedKey,recordUiValueWrapperToEmit);return;}// Denormalization of record ui failed, proceed to refresh
    this.refreshRecordUi(affectedKey);}).catch(error$$1=>{// Denormalization failed for some reason. Could be because there are missing pieces.
    // Try to refresh.
    return this.refreshRecordUi(affectedKey);});}else if(this._ldsCache.getObservables(affectedKey)){// There is an observable for this affectedKey but we couldn't find its value in the cache.
    // TODO W-4485745: If we can't denormalize the RecordUi, we should do the following:
    // - Don't emit yet.
    // - Refresh the value from server.
    {assert$1(false,`Need to denorm/emit a RecordUi we no longer have in cache: ${affectedKey.getKey()}`);}}});});};}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the recordUi.
         * @param recordIds The list of record ids for the recordUi.
         * @param layoutTypes The list of layout types for the recordUi.
         * @param modes The list of modes for the recordUi.
         * @param optionalFields The list of optional fields for the recordUi.
         * @param rootRecordMerge True if the cache should attempt to merge the record values instead of replacing them.
         * @param localFreshRecordUi Optional. A recordUi value you want explicitly put into cache instead of getting the value from the server.
         * @returns Returns a ValueProviderResult as the outcome of the operation.
         */_getFreshValue(cacheAccessor,cacheKey,recordIds,layoutTypes,modes,optionalFields,rootRecordMerge,localFreshRecordUi){if(rootRecordMerge===undefined){rootRecordMerge=false;}let transportResponseThenable;if(localFreshRecordUi){// If the recordUi is provided, we don't go to server to fetch it.
    transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshRecordUi));}else{const params={recordIds,layoutTypes,modes,optionalFields};if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getRecordUi",params,RECORD_UI_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getRecordUis",params);}}return transportResponseThenable.then(transportResponse=>{// Cache miss.
    // It's a cache miss and we are going normalize the recordUi, mark, and merge the spanning records, then stage and commit puts for the
    // records which are merged successfully. Finally we will denorm and stage emits for affected values that haven't changed
    // but depend on changed values.
    const freshRecordUiValue=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);// Nothing should depend on this yet; included for completeness.
    this._normalizeAndStagePutRecordUi([],freshRecordUiValue,cacheAccessor,cacheKey,rootRecordMerge);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}/**
         * Returns true if the existing recordUi cache value is valid, else false.
         * @param cacheAccessor The cacheAccessor.
         * @param normalizedRecordUi The existing recordUi cache value.
         * @returns See description.
         */_validateRecordUiCacheValue(cacheAccessor,normalizedRecordUi){return this._denormalizeRecordUi(normalizedRecordUi,cacheAccessor).then(denormalizedRecordUi=>{return !!denormalizedRecordUi;}).catch(err=>{return false;});}/**
         * Denormalizes a the given normalizedRecordUi value. Will piece back together all the actual values
         * for object infos, records, layouts, etc.
         * @param normalizedRecordUi The normalizedRecordUi to denormalize.
         * @param cacheAccessor The cache accessor.
         * @param recordUiCacheKey The cache
         * @returns A thenable which resolves to the denormalized record ui value or null if it could not be denormalized.
         */_denormalizeRecordUi(normalizedRecordUi,cacheAccessor,recordUiCacheKey){const thenables=[];const denormalizedRecordUi=clone(normalizedRecordUi,recordUiCacheKey);// Object info denormalization.
    const objectInfos=normalizedRecordUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;n++){const objectApiName=objectApiNames[n];const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();thenables.push(cacheAccessor.get(objectInfoCacheKey).then(cachedObjectInfoValueWrapper=>{denormalizedRecordUi.objectInfos[objectApiName]=clone(cachedObjectInfoValueWrapper.value,objectInfoCacheKey);// TODO: W-4672278 - does this need a clone()? Isn't it already frozen?
    }));}// Records denormalization.
    const recordMarkersArray=[];const recordIds=Object.keys(normalizedRecordUi.records);for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const recordMarker=normalizedRecordUi.records[recordId];recordMarkersArray.push(recordMarker);// TODO: what we have (and had since 210) is the full version of the record, not filtered to the set of fields that were requested. Revisit.
    }thenables.push(recordMarkerResolver.fromRecordMarkers(this._recordService,cacheAccessor,recordMarkersArray).then(denormalizedRecordsArray=>{{assert$1(denormalizedRecordsArray.length===recordMarkersArray.length,`Expected ${recordMarkersArray.length} records but received ${denormalizedRecordsArray.length}`);}for(let c=0,len=denormalizedRecordsArray.length;c<len;++c){const denormalizedRecord=denormalizedRecordsArray[c];{assert$1(denormalizedRecord,`Did not get a denormalized record back for marker: ${recordMarkersArray[c].id}`);}denormalizedRecordUi.records[denormalizedRecord.id]=denormalizedRecord;}}));// Layout denormalization.
    const cachedLayoutInfo=normalizedRecordUi.layouts;const cachedLayoutInfoObjectApiNames=Object.keys(cachedLayoutInfo);for(let len=cachedLayoutInfoObjectApiNames.length,n=0;n<len;n++){const objectApiName=cachedLayoutInfoObjectApiNames[n];const recordTypeIds=Object.keys(cachedLayoutInfo[objectApiName]);for(let recordTypeIdsLength=recordTypeIds.length,n1=0;n1<recordTypeIdsLength;n1++){const recordTypeId=recordTypeIds[n1];const layoutTypes=Object.keys(cachedLayoutInfo[objectApiName][recordTypeId]);for(let layoutTypesLength=layoutTypes.length,n2=0;n2<layoutTypesLength;n2++){const layoutType=layoutTypes[n2];const modes=Object.keys(cachedLayoutInfo[objectApiName][recordTypeId][layoutType]);for(let modesLength=modes.length,n3=0;n3<modesLength;n3++){const mode=modes[n3];const layoutCacheKey=new LayoutCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).setLayoutType(layoutType).setMode(mode).build();thenables.push(cacheAccessor.get(layoutCacheKey).then(cachedLayoutValueWrapper=>{// TODO: "cloning" ObjectInfo is a no-op since OIs are frozen. Shouldn't layouts be the same?
    denormalizedRecordUi.layouts[objectApiName][recordTypeId][layoutType][mode]=clone(cachedLayoutValueWrapper.value,layoutCacheKey);}));}}}}// Layout user state denormalization.
    const layoutUserStates=normalizedRecordUi.layoutUserStates;const layoutIds=Object.keys(layoutUserStates);for(let len=layoutIds.length,n=0;n<len;n++){const layoutId=layoutIds[n];// Find the key identifiers for this layout id in the layouts section of the record ui.
    const layoutUserStateMarker=normalizedRecordUi.layoutUserStates[layoutId];const layoutUserStateCacheKey=new LayoutUserStateCacheKeyBuilder().setObjectApiName(layoutUserStateMarker.objectApiName).setRecordTypeId(layoutUserStateMarker.recordTypeId).setLayoutType(layoutUserStateMarker.layoutType).setMode(layoutUserStateMarker.mode).build();thenables.push(cacheAccessor.get(layoutUserStateCacheKey).then(cachedLayoutUserStateValueWrapper=>{denormalizedRecordUi.layoutUserStates[layoutId]=clone(cachedLayoutUserStateValueWrapper.value,layoutUserStateCacheKey);}));}return Thenable.all(thenables).then(()=>{// The denormalized RecordUi should now be ready to go.
    return denormalizedRecordUi;}).catch(rejectionReason=>{const errMsg=`_denormalizeRecordUi() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}throw rejectionReason;});}/**
         * Returns a Thenable that resolves once the RecordUi has been normalized and all necessary puts staged.
         * @param dependentCacheKeys List of dependent cache keys that depend on the given recordUi.
         * @param denormalizedRecordUi Record UI denormalized value
         * @param cacheAccessor An object to access cache directly
         * @param recordUiCacheKey Cache key for Record UI
         * @param rootRecordMerge True if we should attempt to merge the root record during normalization. This should only happen from ADS bridge
         *      code paths. If this request originated from LDS, then we know the record has all the fields we are interested in and is the freshest version.
         * @returns Returns a Thenable that resolves to the normalized RecordUi value once the RecordUi has been normalized and all necessary puts staged, or undefined if there was an error.
         */_normalizeAndStagePutRecordUi(dependentCacheKeys,denormalizedRecordUi,cacheAccessor,recordUiCacheKey,rootRecordMerge){const normalizedRecordUi=clone(denormalizedRecordUi,recordUiCacheKey);const stagePutThenables=[];// Object Info normalization
    const objectInfos=denormalizedRecordUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;n++){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];// Construct the marker.
    normalizedRecordUi.objectInfos[objectApiName]=new ObjectInfoCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setObjectApiName(objectInfo.apiName).setETag(objectInfo.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(OBJECT_INFO_VALUE_TYPE,[recordUiCacheKey],objectInfo,cacheAccessor));}// Layout normalization
    const layouts=denormalizedRecordUi.layouts;const fieldsOnLayoutByObjectApiName={};const layoutObjectApiNames=Object.keys(layouts);for(let len=layoutObjectApiNames.length,n=0;n<len;n++){const objectApiName=layoutObjectApiNames[n];const recordTypeIdObjects=layouts[objectApiName];const recordTypeIds=Object.keys(recordTypeIdObjects);for(let recordTypeIdsLength=recordTypeIds.length,n1=0;n1<recordTypeIdsLength;n1++){const recordTypeId=recordTypeIds[n1];const layoutTypes=recordTypeIdObjects[recordTypeId];const layoutTypeIds=Object.keys(layoutTypes);for(let layoutTypesLength=layoutTypeIds.length,n2=0;n2<layoutTypesLength;n2++){const layoutType=layoutTypeIds[n2];const modeObjects=layoutTypes[layoutType];const modes=Object.keys(modeObjects);for(let modesLength=modes.length,n3=0;n3<modesLength;n3++){const mode=modes[n3];const layout=modeObjects[mode];// Keep track of the set of fields on the layouts.
    if(fieldsOnLayoutByObjectApiName[objectApiName]===undefined){fieldsOnLayoutByObjectApiName[objectApiName]=new UsefulSet();}fieldsOnLayoutByObjectApiName[objectApiName].addAll(getQualifiedFieldApiNamesFromLayout(layout,denormalizedRecordUi.objectInfos[objectApiName]));// Construct the marker for layout.
    normalizedRecordUi.layouts[objectApiName][recordTypeId][layoutType][mode]=new LayoutCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setLayoutType(layout.layoutType).setMode(layout.mode).setETag(layout.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(LAYOUT_VALUE_TYPE,[recordUiCacheKey],layout,cacheAccessor,{objectApiName,recordTypeId}));}}}}// Layout user state normalization.
    const layoutUserStates=denormalizedRecordUi.layoutUserStates;const layoutIds=Object.keys(layoutUserStates);for(let len=layoutIds.length,n=0;n<len;n++){const layoutId=layoutIds[n];const layoutUserState=layoutUserStates[layoutId];// Find the key identifiers for this layout id in the layouts section of the record ui.
    const layoutUserStateKeyParts=this._getLayoutUserStateKeyPartsFromRecordUiByLayoutId(denormalizedRecordUi,layoutId);{assert$1(layoutUserStateKeyParts,"layoutUserStateKeyParts must not be falsy");}const objectApiName=layoutUserStateKeyParts.objectApiName;const recordTypeId=layoutUserStateKeyParts.recordTypeId;const layoutType=layoutUserStateKeyParts.layoutType;const mode=layoutUserStateKeyParts.mode;normalizedRecordUi.layoutUserStates[layoutId]=new LayoutUserStateCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setObjectApiName(layoutUserStateKeyParts.objectApiName).setRecordTypeId(layoutUserStateKeyParts.recordTypeId).setLayoutType(layoutUserStateKeyParts.layoutType).setMode(layoutUserStateKeyParts.mode).build();this._ldsCache.stagePutValue(LAYOUT_USER_STATE_VALUE_TYPE,[recordUiCacheKey],layoutUserState,cacheAccessor,{objectApiName,recordTypeId,layoutType,mode});}// Record normalization
    const recordService=this._ldsCache.getService(RECORD_VALUE_TYPE);const records=denormalizedRecordUi.records;const recordIds=Object.keys(records);for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const record=records[recordId];// Ensure record service tracks ALL the fields on the layouts. This won't necessarily happen
    // when the record gets merged because the record might not have all the fields that are on the full layout.
    const fieldsOnLayout=fieldsOnLayoutByObjectApiName[record.apiName];if(fieldsOnLayout){recordService.addFieldsToTrack(recordId,fieldsOnLayout);}normalizedRecordUi.records[recordId]=recordMarkerUtils.toRecordMarker(cacheAccessor,record,0,denormalizedRecordUi.objectInfos[record.apiName]);const thenable=this._ldsCache.stagePutValue(RECORD_VALUE_TYPE,[recordUiCacheKey],record,cacheAccessor,{rootRecordMerge});stagePutThenables.push(thenable);}return Thenable.all(stagePutThenables).then(()=>{// Stage put the record ui.
    // Strip out the eTag from the value. We don't want to emit eTags!
    delete normalizedRecordUi.eTag;denormalizedRecordUi=this.stripETagsFromValue(denormalizedRecordUi);// Record ui will not store an eTag because it is an aggregate value.
    cacheAccessor.stagePut([],recordUiCacheKey,normalizedRecordUi,denormalizedRecordUi);}).catch(rejectionReason=>{const errMsg=`_normalizeAndStagePutRecordUi() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}throw errMsg;});}/**
         * Constructs and returns the layout user state cache key parts by layout id extracted from the given recordUi.
         * @param recordUi The recordUi to search for the given layoutId.
         * @param layoutId The layoutId of the layout with which to associate the userState update.
         * @returns See description.
         */_getLayoutUserStateKeyPartsFromRecordUiByLayoutId(recordUi,layoutId){// Search through the recordUi.layouts tree structure to find the matching layout with the given layoutId.
    const objectApiNames=Object.keys(recordUi.layouts);for(let len=objectApiNames.length,objectApiNameIndex=0;objectApiNameIndex<len;++objectApiNameIndex){const objectApiName=objectApiNames[objectApiNameIndex];const recordTypeIds=Object.keys(recordUi.layouts[objectApiName]);for(let recordTypeIdsLen=recordTypeIds.length,recordTypeIdIndex=0;recordTypeIdIndex<recordTypeIdsLen;++recordTypeIdIndex){const recordTypeId=recordTypeIds[recordTypeIdIndex];const layoutTypes=Object.keys(recordUi.layouts[objectApiName][recordTypeId]);for(let layoutTypesLen=layoutTypes.length,layoutTypeIndex=0;layoutTypeIndex<layoutTypesLen;++layoutTypeIndex){const layoutType=layoutTypes[layoutTypeIndex];const modes=Object.keys(recordUi.layouts[objectApiName][recordTypeId][layoutType]);for(let modeLength=modes.length,modeIndex=0;modeIndex<modeLength;++modeIndex){const mode=modes[modeIndex];const layout=recordUi.layouts[objectApiName][recordTypeId][layoutType][mode];if(layout.id===layoutId){// We found the matching layout, so construct the payload and return.
    return {objectApiName,recordTypeId,layoutType,mode};}}}}}// A matching layout was not found!
    return null;}/**
         * Constructs a value provider to retrieve a RecordUi.
         * @param recordUiValueProviderParameters See RecordUiValueProviderParams for a description of each parameter.
         * @returns The value provider to retrieve a RecordUi.
         */_createRecordUiValueProvider(recordUiValueProviderParameters){const valueProvider=new ValueProvider((cacheAccessor,recordUiValueProviderParams)=>{const{cacheKey,recordIds,layoutTypes,modes,optionalFields,localFreshRecordUi}=recordUiValueProviderParams;let{forceProvide,rootRecordMerge}=recordUiValueProviderParams;// Set defaults.
    forceProvide=forceProvide===true;rootRecordMerge=rootRecordMerge===true;// We need to inform recordLibrary of new records, wrap the cache accessor which will track all new things in this
    // cache operation and let commitPuts() handle the informs.
    cacheAccessor=recordServiceUtils.wrapCacheAccessor(cacheAccessor,this._adsBridge);// W-5043986: Fix this as part of this story.
    // TODO: since we're effectively unioning all the fields for each entity type together, we need to add tracking for this on the return
    // once we know all the records and their entity types. We're not doing that yet.
    if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,recordIds,layoutTypes,modes,optionalFields,rootRecordMerge,localFreshRecordUi);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+RECORD_UI_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordIds,layoutTypes,modes,optionalFields,rootRecordMerge,localFreshRecordUi);}// Value is not stale, but we still need to validate the cached value
    return this._validateRecordUiCacheValue(cacheAccessor,existingValueWrapper.value).then(isValid=>{if(isValid){// make a call to recordService.getRecordWithFields which will update the record in case it's expired.
    // once the record gets updated, the record-ui's affected key handler will get invoked and thereby an updated record-ui will be emitted.
    const firstRecordId=recordIds[0];const trackedRecordFields=this._recordService.getFieldsForRecord(firstRecordId);const trackedRecordFieldsArray=collectionToArray(trackedRecordFields);// record service is used to check/refresh the record, if the record is stale, the service will refresh it otherwise will return a cache hit.
    this._recordService.getRecordWithFields(firstRecordId,[],trackedRecordFieldsArray);return ValueProviderResult.CACHE_HIT;}// Existing value is not valid; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordIds,layoutTypes,modes,optionalFields,rootRecordMerge,localFreshRecordUi);});}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordIds,layoutTypes,modes,optionalFields,rootRecordMerge,localFreshRecordUi);});},recordUiValueProviderParameters);return valueProvider;}/**
         * @returns Reference to the RecordService instance.
         */get _recordService(){return this._ldsCache.getService(RECORD_VALUE_TYPE);}}/**
     * Wire adapter id: getRecordUi.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     */function getRecordUi(){throw generateError("getRecordUi");}/**
     * A helper validation function to make sure the input to record-ui is valid.
     * @param inputParam The input param.
     * @param paramName The param name.
     * @throws An error for the below scenarios
     *  - inputParam is neither a string or a non-empty string[].
     *  - inputParam is a string and is empty.
     *  - inputParam is an array and at least one element is not of type string or is an empty string.
     */function validateRecordUiInputParam(inputParam,paramName){const isValidString=typeof inputParam==="string"&&!!inputParam.trim();const isArrayNonEmptyAndValidStrings=Array.isArray(inputParam)&&inputParam.length>0&&!inputParam.some(value=>typeof value!=="string"||!value.trim());if(!isValidString&&!isArrayNonEmptyAndValidStrings){throw new Error(`@wire(getRecordUi) parameter ${paramName} must be a string or string array.`);}}/**
     * Generates the wire adapters for:
     *      * @wire getRecordUi
     */class RecordUiWireAdapterGenerator{/**
         * Constructor.
         * @param recordUiService Reference to the RecordUiService instance.
         */constructor(recordUiService){this._recordUiService=recordUiService;}/**
         * Generates the wire adapter for @wire getRecordUi.
         * @returns See description.
         */generateGetRecordUiWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetRecordUi.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Service @wire getRecordUi.
         * @param config Config params for the service. The type is or'd with any so that we can test sending bad configs. Consumers will be able to send us bad configs.
         * @return Observable stream that emits a record ui object.
         */_serviceGetRecordUi(config){if(!config){return undefined;}{const required=["modes","layoutTypes","recordIds"];const supported=["formFactor","layoutTypes","modes","optionalFields","pageSize","recordIds"];const unsupported=["childRelationships"];// TODO W-4421501
    validateConfig("getRecordUi",config,required,supported,unsupported);}if(!config.recordIds||!config.layoutTypes||!config.modes){return undefined;}validateRecordUiInputParam(config.recordIds,"recordIds");validateRecordUiInputParam(config.layoutTypes,"layoutTypes");validateRecordUiInputParam(config.modes,"modes");const recordIds=Array.isArray(config.recordIds)?config.recordIds:[config.recordIds];const layoutTypes=Array.isArray(config.layoutTypes)?config.layoutTypes:[config.layoutTypes];const modes=Array.isArray(config.modes)?config.modes:[config.modes];return this._recordUiService.getRecordUi(recordIds,layoutTypes,modes,config.optionalFields);}}/**
     * Do not use this unless calling from force:recordLibrary. This is a special API only for force:recordLibrary.
     */class AdsBridge{/**
         * Getter for receiveFromLdsCallback.
         * This function is a hook back to recordLibrary to let it know when lds-records retrieves records on its own
         * or from the Raptor side of things. When necessary we use this to keep recordLibrary up to date with records
         * we know about and records/fields it may not have.
         */get receiveFromLdsCallback(){return this._receiveFromLdsCallback;}/**
         * Setter for receiveFromLdsCallback.
         * Can be called from non-typed context!
         */set receiveFromLdsCallback(value){if(value!==undefined&&value!==null){checkType(value,Function);}this._receiveFromLdsCallback=value;}/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){if(Object.getPrototypeOf(this).constructor!==AdsBridge){throw new TypeError("AdsBridge is final and cannot be extended.");}this._ldsCache=ldsCache;}/**
         * Can be called from non-typed context!
         * Do not use this unless calling from force:recordLibrary. This is a special API only for force:recordLibrary.
         * This will:
         * - remove the record from the LdsCache
         * - if eviction is due to a record being unable to be accessed and there is an error message, it should be propagated to observable.error().
         * Questions:
         * - Q: What should we do if there is no existing value or observable? A: Returning null is fine.
         * - Q: Should we be passing next(null) to Observers? What if there are existing Observers out there? Null is a weird contract. A: not doing next(null) is fine.
         * - Q: In order to evict() should you have to provide a non-null replacement value? A: No.
         * - Q: Is the error param a String or an Error? A: it's a string.
         * - Q: Do you need evict() to return anything, like the Observable? A: No.
         * @param recordId The 18 char record ID.
         * @returns The Thenable which will be resolved once the evict is completed. Resolves to the Observable
         *      representing the value if it was found in the cache, otherwise undefined.
         */evict(recordId,error$$1){{assert$1(typeof recordId==="string","recordId must be a string");}const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return this._ldsCache.evictAndDeleteObservable(cacheKey);}/**
         * Can be called from non-typed context!
         * Tells you all of the required and optional fields that lds-records is tracking for a given record.
         * @param recordId The 18 char record ID.
         * @returns An array of qualified field names that lds-records is tracking for a given record.
         *      Will be empty if there are no fields being tracked.
         */getTrackedFieldsForRecord(recordId){{assert$1(typeof recordId==="string","recordId must be a string");}const trackedRecordFieldsSet=this._recordService.getFieldsForRecord(recordId);const trackedRecordFields=collectionToArray(trackedRecordFieldsSet);return trackedRecordFields;}/**
         * Can be called from non-typed context!
         * Do not use this unless calling from force:recordLibrary. This is a special API only for force:recordLibrary.
         * Sticks the value in the TIC and then returns the root (unfiltered) Observable. Adds the fields on the record to the map of required fields in use.
         *
         * This will need to handle merge/replace logic, based on last modified time of the record. (If the times are the same, merge. If the times are different, replace.).
         *
         * TODO: the current merge logic does a straight up merge and does not take SystemModstamp into account yet.
         *
         * Questions:
         * - What should we do we do here if the record we are replacing has more fields than this record? We'd like to to queue a subsequent update, but for view entities
         * will not always have fields that can be easily replaced (they don't exist on the default entity type that the ID will match). Examples are cases where records are
         * allowed to be pushed into RecordGvp and used in conjunction with force:recordCollection. A: If we go with merge, SystemModstamp is preferred, otherwise LastModifiedDate.
         * Other options may include not merging and tracking fields/recordReps by objectApiName. TODO.
         * @param newRecords The records to be added to the LdsCache.
         * @param uiapiEntityWhitelist Whitelist of uiapi entities as key and string value of false to indicate it is unsupported. TODO: Refactor this into a blacklist of boolean!
         * @returns A list of results containing recordId and corresponding the root (unfiltered) Observables.
         */addRecords(newRecords,uiapiEntityWhitelist){{assert$1(newRecords,"newRecords must be provided");assert$1(typeUtils.isArray(newRecords),"newRecords must be an array");}// Process the record if LDS has an observable with something listening to it
    // Otherwise note the fields ADS is tracking for the record.
    const recordsWithObservers=new Map();const recordsWithNoObservers=new Map();for(let newRecordsLen=newRecords.length,n=0;n<newRecordsLen;n++){const newRecord=newRecords[n];this.getRecordValueFromCache(newRecord.id).then(normalizedRecord=>{if(normalizedRecord===undefined){// we dont have a value for root record in the cache.
    // parent record is not subscribed check if the spanning records are subscribed
    recordsWithNoObservers.set(newRecord.id,newRecord);const spanningRecords=recordServiceUtils.getSpanningRecords(newRecord);if(spanningRecords){spanningRecords.forEach((index,spanningRecord)=>{this.getRecordValueFromCache(spanningRecord.id).then(normalizedSpanningRecord=>{if(normalizedSpanningRecord!==undefined){// record existing in the cache
    const exitingSpanningRecord=recordsWithObservers.get(spanningRecord.id);// TODO : Before adding into the Map, check for duplicates and merge the fields
    if(!exitingSpanningRecord||!recordServiceUtils.areFieldsEqualForRecords(exitingSpanningRecord,spanningRecord)){recordsWithObservers.set(spanningRecord.id,spanningRecord);}else{recordsWithNoObservers.set(spanningRecord.id,spanningRecord);}}else{recordsWithNoObservers.set(spanningRecord.id,spanningRecord);}});});}}else{// Parent is subscribed, don't look at the spanning records since we update them as part of parent caching
    recordsWithObservers.set(newRecord.id,newRecord);}});}const addRecordResults=[];recordsWithObservers.forEach((recordWithObserver,recordId)=>{const objectApiName=recordWithObserver.apiName;const allFieldNamesSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(objectApiName,recordWithObserver,allFieldNamesSet);const trackedRecordFields=this._recordService.getFieldsForRecord(recordId);const combinedFields=new UsefulSet(allFieldNamesSet).addAll(trackedRecordFields);// TODO: Why is this a string value for a boolean? Fix it!
    if(uiapiEntityWhitelist&&uiapiEntityWhitelist[objectApiName]==="false"){this._recordService.addUnsupportedEntity(objectApiName);}const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const forceProvide=true;const rootRecordMerge=true;// This is coming from ADS so LDS will not necessarily be getting all the fields it needs, therefore merging is the best option.
    const informRecordLib=false;// addRecord() (this method) is only called from recordLibrary, so it doesn't need to inform itself.
    const resolveRootMerge=false;// resolveRootMerge is passed true when we detect a merge conflict, since this record is being provided to us from ADS, resolveRootMerge = false.
    const recordValueProviderParams={cacheKey,recordId,optionalFields:collectionToArray(combinedFields),forceProvide,localFreshRecord:recordWithObserver,rootRecordMerge,informRecordLib,resolveRootMerge};// TODO: Remove the private method usage once we have serviceToValueType working
    const valueProvider=this._recordService._createRecordValueProvider(recordValueProviderParams);addRecordResults.push({recordId,rootObservable:this._recordService._privateGetRecordWithFields(recordId,[],collectionToArray(combinedFields),valueProvider,false,false)});});// Although LDS is not interested in these records currently and is discarding this notification,
    // keep track of the fields ADS is tracking for these records so that we include these in the future when LDS load these records.
    recordsWithNoObservers.forEach(recordWithNoObserver=>{const recordId=recordWithNoObserver.id;const objectApiName=recordWithNoObserver.apiName;const allFieldNamesSet=new UsefulSet();recordServiceUtils.recursivelyGatherFieldNames(objectApiName,recordWithNoObserver,allFieldNamesSet);this._recordService.setADSFieldsForRecord(recordId).addAll(allFieldNamesSet);});return addRecordResults;}/**
         * Can be called from non-typed context!
         * Do not use this unless calling from raptor wire sevices.
         *
         * Sticks the value in LDS and then returns the root (unfiltered) Observable.
         * @param recordUi The record to add.
         * @returns The root (unfiltered) Observable.
         */addRecordUi(recordUi){{assert$1(recordUi,"recordUi must be provided");}// extracts cache key parameters from a RecordUiRepresentation
    const recordUiCacheKeyBuider=RecordUiCacheKeyBuilder.fromRecordUi(recordUi);const cacheKey=new RecordUiCacheKeyBuilder().setRecordIds(recordUiCacheKeyBuider.getRecordIds()).setLayoutTypes(recordUiCacheKeyBuider.getLayoutTypes()).setModes(recordUiCacheKeyBuider.getModes()).build();const rootRecordMerge=true;return this._recordUiService.cacheRecordUi(cacheKey,recordUi,rootRecordMerge);}/**
         * Tells ADS about a record that LDS has retrieved.
         * @param record The record retrieved by LDS and informed to ADS.
         * @param objectInfo The object info associated with the record, if available.
         */informRecordLib(record,objectInfo){if(this._receiveFromLdsCallback){if(record.id&&record.apiName){const inform=(finalRecord,finalObjectInfo)=>{const nameFields=finalObjectInfo.nameFields?finalObjectInfo.nameFields:[];let nameField;if(nameFields.length>1){if(nameFields.includes("Name")){nameField="Name";}else{nameField=nameFields[0];// Default to whatever.
    // if ("development" !== 'production') {
    //    assert(false, `'Name' was expected to be in the list of nameField names for '${record.apiName}': ${nameFields}`); // TODO: reinstate this once assert is ready for use.
    // }
    }}else if(nameFields.length===1){nameField=nameFields[0];}const objectMetadata={};objectMetadata[finalObjectInfo.apiName]={_keyPrefix:finalObjectInfo.keyPrefix,_nameField:nameField,_entityLabel:finalObjectInfo.label,_canUseLapi:"true"};// ADS expects records.recordId.apiName.record structure. See W-4147555.
    const records={};records[finalRecord.id]={};records[finalRecord.id][finalRecord.apiName]={isPrimary:true,record:getValueForAura(finalRecord)};// We retrieved a new record from the server. Let recordLib know about it.
    this._receiveFromLdsCallback(records,objectMetadata);};if(objectInfo){checkType(objectInfo,Object);inform(record,objectInfo);}else{const objectInfoObservable=this._objectInfoService.getObjectInfo(record.apiName);handleNextObservation(objectInfoObservable,retrievedObjectInfo=>{checkType(retrievedObjectInfo,Object);inform(record,retrievedObjectInfo);});}}else{{// This doesn't look like a record and it's not a cache hit - why are we getting it?
    assert$1(false,`This object should be a record, but it is not: ${record}`);}}}}/**
         * Returns the normalized record data from the cache using cacheKey
         * @param recordId
         * @returns Thenable containing Normalized record
         */getRecordValueFromCache(recordId){const cacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return this._ldsCache.getValue(cacheKey);}/**
         * Reference to the RecordService instance.
         */get _recordService(){return this._ldsCache.getService(RECORD_VALUE_TYPE);}/**
         * Reference to the ObjectInfoService instance.
         */get _objectInfoService(){return this._ldsCache.getService(OBJECT_INFO_VALUE_TYPE);}/**
         * Reference to the RecordUiService instance.
         */get _recordUiService(){return this._ldsCache.getService(RECORD_UI_VALUE_TYPE);}}class InstrumentationServiceAura{markStart(namespace,perfKey,perfContext){return service.markStart(namespace,perfKey,perfContext);}markEnd(namespace,perfKey,perfContext){return service.markEnd(namespace,perfKey,perfContext);}time(){return service.time();}error(attributes,eventSource,eventType){return service.error(attributes,eventSource,eventType);}/**
         * Registers track caches stats for given name.
         * @param name Name of the Cache
         * @returns CacheStats object to track hits and misses.
         */registerCacheStats(name){return service.registerCacheStats(name);}}/**
     * The valueType to use when building ApexCacheKeyBuilder.
     */const APEX_VALUE_TYPE="lds.Apex";/**
     * Time to live for the Apex cache value. 5 minutes.
     */const APEX_TTL=5*60*1000;/**
     * Constructs a cache key for the Apex value type. Keys are constructed from:
     * - namespace
     * - classname
     * - function
     * - params
     */class ApexCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(APEX_VALUE_TYPE);}/**
         * Sets the namespace for the cache key.
         * @param namespace The name space.
         * @returns The current object. Useful for chaining method calls.
         */setNamespace(namespace){this._namespace=namespace;return this;}/**
         * Sets the class name for the cache key.
         * @param classname The class name.
         * @returns The current object. Useful for chaining method calls.
         */setClass(classname){this._classname=classname;return this;}/**
         * Sets the functionName for the cache key.
         * @param functionName The function name.
         * @returns The current object. Useful for chaining method calls.
         */setFunction(functionName){this._functionName=functionName;return this;}/**
         * Sets the params for the cache key.
         * @param params The params.
         * @returns The current object. Useful for chaining method calls.
         */setParams(params){this._params=params.sort().join(KEY_DELIM);return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the Apex value type.
         */build(){return new CacheKey(this.getValueType(),`${this._namespace}${KEY_DELIM}${this._classname}${KEY_DELIM}${this._functionName}${KEY_DELIM}${this._params}`);}}/**
     * Provides functionality to read apex action data from the cache. Can refresh the data from the server.
     */class ApexService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[APEX_VALUE_TYPE]);}getCacheValueTtl(){return APEX_TTL;}/**
         * Checks the cache to see if a value is cached and is within TTL and if so returns the value cached.
         * If the value is not cached or TTL-ed, makes a call to the ApexActionController to fetch the apex controller value.
         *  - If the apex controller value is cacheable, caches the value and returns the value.
         *  - If the apex controller value is not cacheable, then returns the value.
         * @param namespace The namespace of the Apex controller.
         * @param classname The class name of the Apex controller.
         * @param method The method of the Apex controller.
         * @param params The parameters to pass into the apex action controller.
         * @param cacheable Whether or not the action is cacheable. Defaults to true.
         * @returns See description.
         */runApex(namespace,classname,method,params){const cacheKey=new ApexCacheKeyBuilder().setNamespace(namespace).setClass(classname).setFunction(method).setParams(params?Object.entries(params):[]).build();return this._ldsCache.getValue(cacheKey).then(apexValueWrapper=>{if(apexValueWrapper!==undefined&&isWithinTtl(this._ldsCache.timeSource.now(),apexValueWrapper.lastFetchTime,APEX_TTL)){// value exists in cache is not TTL-ed, so return the value.
    return apexValueWrapper.value;}// value either does not exist in cache or is TTL-ed
    // fetch fresh value from server
    const cacheable=false;return this._getFreshValueTransportThenable(namespace,classname,method,params,cacheable).then(transportResponse=>{const localFreshApex=transportResponse.body;if(localFreshApex.cacheable){// if apex method is cacheable, then call the value provider which will cache the response and convert the observable to a promise and returns the promise.
    const valueProviderParameters={cacheKey,namespace,classname,method,params,metaConfig:undefined,localFreshApex};// create a value provider and call ldsCache.get to cache the local value.
    const valueProvider=this._createApexValueProvider(valueProviderParameters);return observableToPromise(this._ldsCache.get(cacheKey,valueProvider),true);}else{// if the apex method is not cacheable, then return the response without caching it.
    return localFreshApex.returnValue;}}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});});}/**
         * Retrieves an apex controller value from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
         * @param namespace The namespace of the Apex controller.
         * @param classname The class name of the Apex controller.
         * @param method The method of the Apex controller.
         * @param params The parameters to pass into the Apex controller.
         * @param metaConfig Optional configuration object.
         */getApex(namespace,classname,method,params,metaConfig){const cacheKey=new ApexCacheKeyBuilder().setNamespace(namespace).setClass(classname).setFunction(method).setParams(params?Object.entries(params):[]).build();const valueProviderParameters={cacheKey,namespace,classname,method,params,metaConfig};const valueProvider=this._createApexValueProvider(valueProviderParameters);const finishedCallbacks=metaConfig&&metaConfig.finishedCallbacks;const observable=this._ldsCache.get(cacheKey,valueProvider,finishedCallbacks);return observable;}/**
         * Constructs a value provider to retrieve an apex action.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve an Apex controller value.
         */_createApexValueProvider(valueProviderParameters){const{cacheKey,namespace,classname,method,params,metaConfig,localFreshApex}=valueProviderParameters;const valueProvider=new ValueProvider(cacheAccessor=>{if(metaConfig&&metaConfig.forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,namespace,classname,method,params,localFreshApex);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+APEX_TTL;if(needsRefresh){// Trigger a refresh. We don't care about the return value of this, we just need to force an API call
    // to keep the Observable's data stream alive.
    return this._getFreshValue(cacheAccessor,cacheKey,namespace,classname,method,params,localFreshApex);}return ValueProviderResult.CACHE_HIT;}return this._getFreshValue(cacheAccessor,cacheKey,namespace,classname,method,params,localFreshApex);});},valueProviderParameters);return valueProvider;}/**
         * Creates a transport response thenable with the output from ApexActionController's execute method.
         * @param namespace The namespace of the Apex controller.
         * @param classname The class name of the Apex controller.
         * @param method The method of the Apex controller.
         * @param params The parameters to pass into the apex action controller.
         * @param cacheable Whether the response should be cacheable or not.
         * @returns Returns a Thenable of transport response representing the outcome of the ApexActionController's execute method.
         */_getFreshValueTransportThenable(namespace,classname,method,params,cacheable){return executeAuraGlobalController("ApexActionController.execute",{namespace,classname,method,params,cacheable},{hotspot:false,background:false});}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the apex action.
         * @param namespace The namespace of the Apex controller.
         * @param classname The class name of the Apex controller.
         * @param method The method of the Apex controller.
         * @param params The parameters to pass into the apex action controller.
         * @returns Returns a ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,namespace,classname,method,params,localFreshApex){let transportResponseThenable;// If the apex value is provided, we don't go to server to fetch it.
    if(localFreshApex){transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshApex));}else{const cacheable=true;transportResponseThenable=this._getFreshValueTransportThenable(namespace,classname,method,params,cacheable);}return transportResponseThenable.then(transportResponse=>{return ThenableFactory.resolve(undefined).then(()=>{const apexCacheValue=transportResponse.body;// nothing to normalize
    return this.stagePutValue([],apexCacheValue.returnValue,cacheAccessor,cacheKey);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}/**
         * @param dependentCacheKeys An array of cache keys that depend on the given apex value.
         * @param value The value to stagePut.
         * @param cacheAccessor An object to access cache directly.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,value,cacheAccessor,additionalData){cacheAccessor.stagePut(dependentCacheKeys,additionalData,value,value);return ThenableFactory.resolve(undefined);}/**
         * TODO: Make this actually strip out the eTags!
         * Strips all eTag properties from the given value by directly deleting them.
         * @param value The value from which to strip the eTags.
         * @returns The given value with its eTags stripped.
         */stripETagsFromValue(value){return value;}}/**
     * Generates the wire adapter for Apex.
     */class ApexWireAdapterGenerator{/**
         * Constructor.
         * @param apexService Reference to the ApexService instance.
         */constructor(apexService){this._apexService=apexService;}/**
         * Generates the wire adapter for getApex.
         * @param namespace namespace of the Apex controller.
         * @param classname classname of the Apex controller.
         * @param method method name of the Apex controller.
         * @returns See description.
         */generateGetApexWireAdapter(namespace,classname,method){const wireAdapter=generateWireAdapter(this._serviceGetApex.bind(this,namespace,classname,method));return wireAdapter;}/**
         * Returns the method which invokes the Apex GlobalController with the config passed
         * @param namespace namespace of the Apex controller.
         * @param classname classname of the Apex controller.
         * @param method method name of the Apex controller.
         */getApexInvoker(namespace,classname,method){return config=>{return this._apexService.runApex(namespace,classname,method,config);};}/**
         * Service getApex @wire.
         * @param namespace namespace of the Apex controller.
         * @param classname classname of the Apex controller.
         * @param method method name of the Apex controller.
         * @param config Config params for the service.
         * @param metaConfig Additional configuration to specify cache behavior.
         * @returns Observable stream that emits Apex controller values.
         */_serviceGetApex(namespace,classname,method,config,metaConfig){if(!this._validateApexConfig(config)){return undefined;}return this._apexService.getApex(namespace,classname,method,config,metaConfig);}/**
         *  Validates the apex request configuration passed in from @wire.
         *  @param config The configuration object passed from @wire.
         *  @returns True if config is null/undefined or false if it does not contain undefined values.
         */_validateApexConfig(config){if(config){const values=Object.values(config);if(values&&values.indexOf(undefined)!==-1){return false;}}return true;}}/**
     * Gets a field value from an Apex sObject.
     * @param sobject The sObject holding the field.
     * @param field The qualified API name of the field to return.
     * @returns The field's value. If it doesn't exist, undefined is returned.
     */function getSObjectValue(sObject,field){const unqualifiedField=splitQualifiedFieldApiName(getFieldApiName(field))[1];const fields=unqualifiedField.split(".");while(fields.length>0){const nextField=fields.shift();// if field or path to field is not found then return undefined
    if(!(nextField in sObject)){return undefined;}sObject=sObject[nextField];}return sObject;}/**
     * The valueType to use when building FormCacheKeyBuilder.
     */const FORM_VALUE_TYPE="uiapi.FormRepresentation";/**
     * Time to live for a form cache value. 30 days.
     */const FORM_TTL=2592000000;/**
     * Constructs a cache key for the Form value type. Keys are constructed from:
     * - apiName
     *
     * Form cache key is used as cache key for form data provided by UI API.
     */class FormCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(FORM_VALUE_TYPE);}/**
         * Sets the apiName for the cache key.
         * @param apiName The api name of the form.
         * @returns The current object. Useful for chaining method calls.
         */setApiName(apiName){this.apiName=apiName;return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the Form value type.
         */build(){{assert$1(this.apiName,"A non-empty apiName must be provided.");}return new CacheKey(this.getValueType(),`${this.apiName}`);}}/*
     * Provides functionality to read form data from the cache. Can refresh the data from the server.
     */class FormService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[FORM_VALUE_TYPE]);}getCacheValueTtl(){return FORM_TTL;}/**
         * Retrieves a form from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
         * @param apiName The object api name of the layout to retrieve.
         * @returns The observable used to get the value and keep watch on it for changes.
         */getForm(apiName){const cacheKey=new FormCacheKeyBuilder().setApiName(apiName).build();const valueProviderParameters={cacheKey,apiName,forceProvide:false};const valueProvider=this._createFormValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Stage puts the given form.
         * @param dependentCacheKeys An array of cache keys that depend on the given formUi.
         * @param form The form to cache.
         * @param cacheAccessor An object to access cache directly.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,form,cacheAccessor){const formCacheKey=new FormCacheKeyBuilder().setApiName(form.apiName).build();return cacheAccessor.get(formCacheKey).then(existingValueWrapper=>{const eTag=form.eTag;if(existingValueWrapper&&existingValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(formCacheKey);}// Strip out the eTag from the value. We don't want to emit eTags!
    form=this.stripETagsFromValue(form);return cacheAccessor.stagePut(dependentCacheKeys,formCacheKey,form,form,{eTag});});}/**
         * Strips all eTag properties from the given form by directly deleting them.
         * @param form The form from which to strip the eTags.
         * @returns The given form object with its eTags stripped.
         */stripETagsFromValue(form){delete form.eTag;return form;}/**
         * Constructs a value provider to retrieve a Form.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve a form.
         */_createFormValueProvider(valueProviderParameters){const{// Do NOT set defaults here. See W-4840393.
    cacheKey,apiName,forceProvide}=valueProviderParameters;const formValueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,apiName);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+FORM_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,apiName,existingValueWrapper.eTag);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,apiName);});},valueProviderParameters);return formValueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the form.
         * @param apiName The form api name of the form to retrieve.
         * @param eTagToCheck eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns Returns a ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,apiName,eTagToCheck){// If the form is provided, we don't go to server to fetch it.
    const params={apiName};let transportResponseThenable;if(eTagToCheck){params.clientOptions={eTagToCheck};}if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getForm",params,FORM_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getForm",params);}return transportResponseThenable.then(transportResponse=>{// Cache miss refresh unchanged.
    if(transportResponse.status===304){return ThenableFactory.resolve(ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED);}// Cache miss.
    return ThenableFactory.resolve(undefined).then(()=>{const freshForm=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);// Nothing should depend on this yet; included for completeness.
    this.stagePutValue([],freshForm,cacheAccessor);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Cache value marker for form.
     */class FormCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param formApiName The objectApiName for the marker.
         * @param eTag The eTag for the marker.
         */constructor(timestamp,formApiName,eTag){super(timestamp);this.formApiName=formApiName;this.eTag=eTag;}}/**
     * Constructs a FormCacheValueMarker.
     */class FormCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the formApiName for the marker.
         * @param formApiName The formApiName for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setFormApiName(formApiName){this._formApiName=formApiName;return this;}/**
         * Sets the eTag for the marker.
         * @param eTag The eTag for the marker.
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Builds the LayoutCacheValueMarker with the assigned parameters.
         * @returns A new LayoutCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._formApiName,"A non-empty formApiName must be set.");}return new FormCacheValueMarker(this._timestamp,this._formApiName,this._eTag);}}/**
     * The valueType to use when building FormUiCacheKeyBuilder.
     */const FORM_UI_VALUE_TYPE="uiapi.FormSectionUiRepresentation";/**
     * The valueType to use when building FormSectionUiObservableCacheKeyBuilder.
     */const FORM_SECTION_UI_OBSERVABLE_VALUE_TYPE="lds.FormSectionUiObservable";/**
     * Time to live for FormUi object. 15 minutes.
     */const FORM_UI_TTL=15*60*1000;/**
     * Constructs a cache key for the FormUi value type. Keys are constructed from:
     * - recordId
     * - formName
     * - sectionName
     */class FormUiCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(FORM_UI_VALUE_TYPE);}/**
         * Sets the recordIds for the cache key.
         * @param recordIds The record ids for the cache key.
         * @returns The current object. Useful for chaining method calls.
         */setRecordIds(recordIds){this._recordIds=recordIds.slice();return this;}/**
         * @returns The record ids for the cache key.
         */getRecordIds(){return this._recordIds;}/**
         * Sets the form names for the cache key.
         * @param formNames The form names for the cache key.
         * @returns The current object. Useful for chaining method calls.
         */setFormNames(formNames){this._formNames=formNames.slice();return this;}/**
         * @returns The form names for the cache key.
         */getFormNames(){return this._formNames;}/**
         * Builds the cache key.
         * @returns A new cache key representing the FormUi value type.
         */build(){/**
             * Tagged template helper function for formatting key errors.
             * @param literals The template strings.
             * @param key Identifies the subkey.
             * @param valueFound The list of values that were attempted to be combined into a subkey.
             * @param singleValue The individual value that triggered the error.
             * @returns A formatted error string describing the error.
             */function errorFormatter(literals,key,valueFound,singleValue){let base=`${key} should be a string list, but received ${valueFound}`;if(singleValue){base+=`, list contains an entry with value ${singleValue}`;}return base;}/**
             * Constructs a subkey from the given list.
             * @param list List of values to combine into a subkey.
             * @param key Identifier for the subkey. Used in errors.
             * @returns The constructed subkey.
             */function constructKeyFromStringList(list,key){{list.forEach(field=>{assert$1(field,errorFormatter`${key}${list}${field}`);});}return list.join(",");}{assert$1(this._recordIds.length,"Non-empty recordIds must be provided.");assert$1(this._formNames.length,"Non-empty formNames must be provided.");}const recordIds=constructKeyFromStringList(this._recordIds,"recordIds");const formNames=constructKeyFromStringList(this._formNames,"formsNames");return new CacheKey(this.getValueType(),`${recordIds}${KEY_DELIM}${formNames}`);}/**
         * Returns a FormUiCacheKeyBuilder based on the given cacheKey.
         * @param cacheKey A FormUi CacheKey.
         * @returns A FormUiCacheKeyBuilder based on a keyString.
         */static fromCacheKey(cacheKey){{assert$1(cacheKey.getValueType()===FORM_UI_VALUE_TYPE,`valueType was expected to be FORM_UI_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);const builder=new FormUiCacheKeyBuilder();builder.setRecordIds(localKeyParts[0].split(","));if(localKeyParts.length>1){const formNames=localKeyParts[1]===""?[]:localKeyParts[1].split(",");builder.setFormNames(formNames);}return builder;}/**
         * Returns a FormUiCacheKeyBuilder based on the provided formUi value.
         * @param formUi The formUi value.
         * @returns See description.
         */static fromFormUi(formUi){return new FormUiCacheKeyBuilder().setRecordIds(Object.keys(formUi.records)).setFormNames(Object.keys(formUi.forms));}}/**
     * Constructs a cache key for the FORM_SECTION_UI_OBSERVABLE_VALUE_TYPE as a form section ui. Keys are constructed from:
     * - recordId
     * - formName
     * - sectionName
     */class FormSectionUiObservableKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(FORM_SECTION_UI_OBSERVABLE_VALUE_TYPE);}/**
         * Sets the recordId for the cache key.
         * @param recordId The record id.
         * @returns The current object. Useful for chaining method calls.
         */setRecordId(recordId){this._recordId=recordId;return this;}/**
         * @returns The record id for the cache key.
         */getRecordId(){return this._recordId;}/**
         * Sets the formName for the cache key.
         * @param formName The form name for the cache key.
         * @returns The current object. Useful for chaining method calls.
         */setFormName(formName){this._formName=formName;return this;}/**
         * @returns The form name for the cache key.
         */getFormName(){return this._formName;}/**
         * Sets the section name for the cache key.
         * @param sectionName The section name for the cache key.
         * @returns The current object. Useful for chaining method calls.
         */setSectionName(sectionName){this._sectionName=sectionName;return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the FORM_SECTION_UI_OBSERVABLE_VALUE_TYPE value type.
         */build(){{assert$1(this._recordId,"Non-empty recordId must be provided.");assert$1(this._formName,"Non-empty formName must be provided.");assert$1(this._sectionName,"Non-empty sectionName must be provided.");}return new CacheKey(this.getValueType(),`${this._recordId}${KEY_DELIM}${this._formName}${KEY_DELIM}${this._sectionName}`);}}/**
     * Provides functionality to read record ui data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for this value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class FormUiService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param adsBridge Reference to the AdsBridge instance.
         */constructor(ldsCache,adsBridge){super(ldsCache,[FORM_UI_VALUE_TYPE]);this._adsBridge=adsBridge;this._formSectionUiObservables=new Map();}getCacheValueTtl(){return FORM_UI_TTL;}/**
         * Returns an observable for a FormSectionUi value specified by the given inputs.
         * @param formApiName The form name of the form that the section belongs to.
         * @param formSectionApiName The section name of the form.
         * @param recordId The record id of the record to include in the form section ui.
         * @returns See description.
         */getFormSectionUi(formApiName,formSectionApiName,recordId){// Validate input.
    checkType(formApiName,String);checkType(formSectionApiName,String);checkType(recordId,String);// Get the form-ui.
    const cacheKey=new FormUiCacheKeyBuilder().setRecordIds([recordId]).setFormNames([formApiName]).build();const valueProvider=this._createFormUiValueProvider({cacheKey,recordId,formApiName,forceProvide:false});this._ldsCache.get(cacheKey,valueProvider);// Use an observable chain to transform the form-ui into a form-section-ui.
    const formSectionUiObservableKey=new FormSectionUiObservableKeyBuilder().setRecordId(recordId).setFormName(formApiName).setSectionName(formSectionApiName).build();const formSectionUiObservables=this._formSectionUiObservables;let formSectionUiObservable=formSectionUiObservables.get(formSectionUiObservableKey.getKey());if(!formSectionUiObservable){const formUiCoreObservables=this._ldsCache.getOrCreateObservables(cacheKey,this.getCacheValueTtl());// We pass observables.changesOnly here so that any formSectionUi observables don't have their chains executed if the formUi isn't different.
    // This should save on perf.
    formSectionUiObservable=this._constructFormSectionUiObservable(formSectionUiObservableKey,formUiCoreObservables.finalTransformed,formApiName,formSectionApiName,recordId);formSectionUiObservables.set(formSectionUiObservableKey.getKey(),formSectionUiObservable);}return formSectionUiObservable;}/**
         * Normalizes the given FormUi value and stage puts it and all its sub-values. Use this when you have a FormUi value locally and you want to commit it as part
         * of an existing CacheAccessor transaction.
         * @param dependentCacheKeys An array of cache keys that depend on the given formUi.
         * @param aggregateUi The aggregateUi response value.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData Property bag that contains additional values for determining how stagePutting happens.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,formUi,cacheAccessor,additionalData){// Defaults.
    additionalData=additionalData?additionalData:{rootRecordMerge:true};const formUiCacheKey=FormUiCacheKeyBuilder.fromFormUi(formUi).build();return this._normalizeAndStagePutFormUi(dependentCacheKeys,formUi,cacheAccessor,formUiCacheKey,additionalData.rootRecordMerge).then(()=>{return;});}/**
         * Strips all eTag properties from the given formUi by directly deleting them.
         * @param formUi The formUi from which to strip the eTags.
         * @returns The given formUi with its eTags stripped.
         */stripETagsFromValue(formUi){delete formUi.eTag;// Strip eTags from object infos.
    const objectInfos=formUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;++n){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];objectInfos[objectApiName]=this._ldsCache.stripETagsFromValue(OBJECT_INFO_VALUE_TYPE,objectInfo);}// Strip eTags from forms.
    const forms=formUi.forms;const formApiNames=Object.keys(forms);for(let formApiNameIndex=0,len=formApiNames.length;formApiNameIndex<len;++formApiNameIndex){const formApiName=formApiNames[formApiNameIndex];const form=formUi.forms[formApiName];formUi.forms[formApiName]=this._ldsCache.stripETagsFromValue(FORM_VALUE_TYPE,form);}// Strip eTags from records.
    const records=formUi.records;const recordIds=Object.keys(records);for(let n=0,len=recordIds.length;n<len;++n){const recordId=recordIds[n];const record=records[recordId];this._ldsCache.stripETagsFromValue(RECORD_VALUE_TYPE,record);}return formUi;}/**
         * @returns The affected key handler for this service.
         */getAffectedKeyHandler(){return (affectedKey,cacheAccessor)=>{{assert$1(affectedKey.getValueType()===FORM_UI_VALUE_TYPE,`Expected FORM_UI_VALUE_TYPE value type for FormUi: ${affectedKey.getValueType().toString()}`);}return cacheAccessor.get(affectedKey).then(formUiWrapper=>{let refreshFormUi=false;if(formUiWrapper&&formUiWrapper.value){const normalizedFormUi=formUiWrapper.value;// We need to detect if any of the records' record types have changed. If they have, we must fully refresh. If not, we
    // can just denorm and stage an emit for it.
    const recordMarkers=normalizedFormUi.records;const recordIds=Object.keys(recordMarkers);for(let len=recordIds.length,c=0;c<len;++c){const recordId=recordIds[c];const recordMarker=recordMarkers[recordId];const recordMarkerRecordTypeId=recordMarker.recordTypeId;const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const refreshedRecordValueWrapper=cacheAccessor.getCommitted(recordCacheKey);if(refreshedRecordValueWrapper){// TODO: Update this to NormalizedRecord type when record-service is converted to typescript.
    const refreshedRecord=refreshedRecordValueWrapper.value;// A record matching this marker has been committed as part of this cache transaction. See if its record type changed.
    // If it did we need to do a full refresh of this FormUi, otherwise we can just denorm/emit it. We don't need to
    // worry about records that weren't committed as part of this cache transaction because they haven't changed.
    // We use null rather than undefined here to be consistent with what we'll find in the API JSON payloads.
    const refreshedRecordTypeId=refreshedRecord.recordTypeInfo?refreshedRecord.recordTypeInfo.recordTypeId:null;if(recordMarkerRecordTypeId!==refreshedRecordTypeId){refreshFormUi=true;break;}}}// Maybe an ObjectInfo changed, if so determining its effect could be difficult so do a full refresh to be sure we get it right.
    if(!refreshFormUi){// Don't make further checks if we don't need to.
    const objectInfoMarkers=normalizedFormUi.objectInfos;const objectApiNames=Object.keys(objectInfoMarkers);for(let len=objectApiNames.length,c=0;c<len;++c){const objectApiName=objectApiNames[c];const objectInfoMarker=objectInfoMarkers[objectApiName];const objectInfoETag=objectInfoMarker.eTag;const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();const refreshedObjectInfoValueWrapper=cacheAccessor.getCommitted(objectInfoCacheKey);if(refreshedObjectInfoValueWrapper){if(objectInfoETag!==refreshedObjectInfoValueWrapper.eTag){refreshFormUi=true;break;}}}}}if(refreshFormUi){this._refreshFormUi(affectedKey);return;}// A full refresh is unnecessary -- just do denorm and staging of an emit.
    return cacheAccessor.get(affectedKey).then(normalizedFormUiValueWrapper=>{if(normalizedFormUiValueWrapper){const normalizedFormUi=normalizedFormUiValueWrapper.value;this._denormalizeFormUi(normalizedFormUi,cacheAccessor,affectedKey).then(formUi=>{// Denormalization was successful, return formUi
    if(formUi){const formUiValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(normalizedFormUiValueWrapper,formUi);cacheAccessor.stageEmit(affectedKey,formUiValueWrapperToEmit);}else{// Denormalization of formUi failed, proceed to refresh
    this._refreshFormUi(affectedKey);}}).catch(error$$1=>{// Denormalization failed for some reason. Could be because there are missing pieces.
    // Try to refresh.
    this._refreshFormUi(affectedKey);});}else if(this._ldsCache.getObservables(affectedKey)){// There is an observable for this affectedKey but we couldn't find its value in the cache.
    // TODO W-4485745: If we can't denormalize the FormUi, we should do the following:
    // - Don't emit yet.
    // - Refresh the value from server.
    {assert$1(false,`Need to denorm/emit a FormUi we no longer have in cache: ${affectedKey.getKey()}`);}}});});};}/**
         * Strips all eTag properties from the given formSectionUi by directly deleting them.
         * @param formSectionUi The formSectionUi from which to strip the eTags.
         * @returns The given formSectionUi with its eTags stripped.
         */stripETagsFromFormSectionUi(formSectionUi){delete formSectionUi.eTag;// Strip eTags from object infos.
    const objectInfos=formSectionUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;++n){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];objectInfos[objectApiName]=this._ldsCache.stripETagsFromValue(OBJECT_INFO_VALUE_TYPE,objectInfo);}// Strip eTags from record.
    const record=formSectionUi.record;this._ldsCache.stripETagsFromValue(RECORD_VALUE_TYPE,record);return formSectionUi;}/**
         * Constructs a value provider to retrieve a FormUi.
         * @param formUiValueProviderParameters: Parameters object for the ValueProvider. See the interface for property descriptions.
         * @returns ValueProvider: The value provider to retrieve a FormUi.
         */_createFormUiValueProvider(formUiValueProviderParameters){const valueProvider=new ValueProvider((cacheAccessor,formUiValueProviderParams)=>{const{cacheKey,recordId,formApiName,localFreshFormUi}=formUiValueProviderParams;let{forceProvide,rootRecordMerge}=formUiValueProviderParams;// Explicitly set defaults.
    forceProvide=forceProvide!==undefined?forceProvide:false;// When W-5029346 is completed, we can set rootRecordMerge to false!
    rootRecordMerge=rootRecordMerge!==undefined?rootRecordMerge:true;// We need to inform recordLibrary of new records, wrap the cache accessor which will track all new things in this
    // cache operation and let commitPuts() handle the informs.
    cacheAccessor=recordServiceUtils.wrapCacheAccessor(cacheAccessor,this._adsBridge);if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,recordId,formApiName,rootRecordMerge,localFreshFormUi);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const existingValue=existingValueWrapper.value;const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// Check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+FORM_UI_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordId,formApiName,rootRecordMerge,localFreshFormUi);}// Value is not stale, but we still need to validate the cached value.
    return this._validateExistingFormUiCacheValue(cacheAccessor,existingValue).then(value=>{if(value){return ValueProviderResult.CACHE_HIT;}// Existing value is not valid; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordId,formApiName,rootRecordMerge,localFreshFormUi);});}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,recordId,formApiName,rootRecordMerge,localFreshFormUi);});},formUiValueProviderParameters);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the formUi.
         * @param recordId The char ID of the record to retrieve.
         * @param formApiName The form api name of the form to retrieve.
         * @param rootRecordMerge True if the cache should attempt to merge the record values instead of replacing them.
         * @param localFreshFormUi A formUi value you want explicitly put into cache instead of getting the value from the server.
         * @returns Returns a Thenable that resolves to the outcome of the ValueProvider.
         */_getFreshValue(cacheAccessor,cacheKey,recordId,formApiName,rootRecordMerge,localFreshFormUi){let transportResponseThenable;// If the formUi is provided, we don't go to server to fetch it.
    if(localFreshFormUi){transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshFormUi));}else{const params={query:`FormWithRecord:${formApiName}:${recordId}`};if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getFormSectionUi",params,FORM_UI_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getAggregateUi",params);}}return transportResponseThenable.then(transportResponse=>{// Cache miss
    const freshAggregateUiValue=transportResponse.body;// Transform the aggregate ui value into a formUi value.
    delete freshAggregateUiValue.layoutUserStates;delete freshAggregateUiValue.layouts;const freshFormUiValue=freshAggregateUiValue;// It's a cache miss and we are going normalize the formUi.
    cacheAccessor.stageClearDependencies(cacheKey);// Nothing should depend on this yet; included for completeness.
    return this._normalizeAndStagePutFormUi([],freshFormUiValue,cacheAccessor,cacheKey,rootRecordMerge);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    // Do not go gentle into that good night.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);}throw rejectionReason;});}/**
         * Returns true if the existing formUi cache value is valid, else false.
         * @param cacheAccessor The cacheAccessor.
         * @param normalizedFormUi The existing normalized formUi cache value.
         * @returns See description.
         */_validateExistingFormUiCacheValue(cacheAccessor,normalizedFormUi){return this._denormalizeFormUi(normalizedFormUi,cacheAccessor).then(denormalizedFormUi=>{return !!denormalizedFormUi;});}/**
         * Takes the normalized formUi and cacheAccessor and returns the denormalized formUi.
         * @param normalizedFormUi The formUi to denormalized. This should always be a normalized formUi that came from the cache.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param formUiCacheKey The cache key for the formUi.
         * @returns A Thenable that will resolve to the denormalized formUi.
         */_denormalizeFormUi(normalizedFormUi,cacheAccessor,formUiCacheKey){const thenables=[];const denormalizedFormUi=clone(normalizedFormUi,formUiCacheKey);// Object infos denormalization.
    const objectInfos=normalizedFormUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;n++){const objectApiName=objectApiNames[n];const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();thenables.push(cacheAccessor.get(objectInfoCacheKey).then(cachedObjectInfoValueWrapper=>{denormalizedFormUi.objectInfos[objectApiName]=cachedObjectInfoValueWrapper.value;}));}// Forms denormalization.
    const forms=normalizedFormUi.forms;const formApiNames=Object.keys(forms);for(let len=formApiNames.length,n=0;n<len;n++){const formApiName=formApiNames[n];const formCacheKey=new FormCacheKeyBuilder().setApiName(formApiName).build();thenables.push(cacheAccessor.get(formCacheKey).then(cachedFormValueWrapper=>{denormalizedFormUi.forms[formApiName]=cachedFormValueWrapper.value;}));}// Records denormalization.
    const recordMarkersArray=[];const recordIds=Object.keys(normalizedFormUi.records);for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const recordMarker=normalizedFormUi.records[recordId];recordMarkersArray.push(recordMarker);// TODO: what we have (and had since 210) is the full version of the record, not filtered to the set of fields that were requested. Revisit.
    }const recordService=this._ldsCache.getService(RECORD_VALUE_TYPE);thenables.push(recordMarkerResolver.fromRecordMarkers(recordService,cacheAccessor,recordMarkersArray).then(denormalizedRecordsArray=>{{assert$1(denormalizedRecordsArray.length===recordMarkersArray.length,`Expected ${recordMarkersArray.length} records but received ${denormalizedRecordsArray.length}`);}for(let len=denormalizedRecordsArray.length,c=0;c<len;++c){const denormalizedRecord=denormalizedRecordsArray[c];{assert$1(denormalizedRecord,`Did not get a denormalized record back for marker: ${recordMarkersArray[c].id}`);}denormalizedFormUi.records[denormalizedRecord.id]=denormalizedRecord;}}));return Thenable.all(thenables).then(()=>{// The denormalized FormUi should now be ready to go.
    return denormalizedFormUi;}).catch(rejectionReason=>{const errMsg=`_denormalizeFormUi() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}});}/**
         * Returns a Thenable that resolves once the FormUi has been normalized and all necessary puts staged.
         * @param dependentCacheKeys An array of cache keys which depend on the given denormalizedFormUi.
         * @param denormalizedFormUi FormUi denormalized value.
         * @param cacheAccessor An object to access cache directly.
         * @param formUiCacheKey Cache key for Record UI.
         * @param rootRecordMerge True if we should attempt to merge the root record during normalization. This should only happen from ADS bridge
         *      code paths. If this request originated from LDS, then we know the record has all the fields we are interested in and is the freshest version.
         * @returns Returns a Thenable that resolves to the normalized FormUi value once
         *      the FormUi has been normalized and all necessary puts staged.
         */_normalizeAndStagePutFormUi(dependentCacheKeys,denormalizedFormUi,cacheAccessor,formUiCacheKey,rootRecordMerge){const normalizedFormUi=clone(denormalizedFormUi,formUiCacheKey);const stagePutThenables=[];// Object Info normalization
    const objectInfos=denormalizedFormUi.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;n++){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];// Construct the marker.
    normalizedFormUi.objectInfos[objectApiName]=new ObjectInfoCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setObjectApiName(objectInfo.apiName).setETag(objectInfo.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(OBJECT_INFO_VALUE_TYPE,[formUiCacheKey],objectInfo,cacheAccessor));}// Forms normalization
    const forms=denormalizedFormUi.forms;const formApiNames=Object.keys(forms);for(let len=formApiNames.length,n=0;n<len;n++){const formApiName=formApiNames[n];const form=forms[formApiName];// Construct the marker.
    normalizedFormUi.forms[formApiName]=new FormCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setFormApiName(formApiName).setETag(form.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(FORM_VALUE_TYPE,[formUiCacheKey],form,cacheAccessor));}// Records normalization
    const records=denormalizedFormUi.records;const recordIds=Object.keys(records);const toRecordMarker=recordMarkerUtils.toRecordMarker.bind(recordMarkerUtils);for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const record=records[recordId];normalizedFormUi.records[recordId]=toRecordMarker(cacheAccessor,record,0);stagePutThenables.push(this._ldsCache.stagePutValue(RECORD_VALUE_TYPE,[formUiCacheKey],record,cacheAccessor,{rootRecordMerge}));}return Thenable.all(stagePutThenables).then(()=>{// Strip out the eTag from the value. We don't want to emit eTags!
    const eTag=normalizedFormUi.eTag;delete normalizedFormUi.eTag;denormalizedFormUi=this.stripETagsFromValue(denormalizedFormUi);// Stage put the formUi.
    cacheAccessor.stagePut(dependentCacheKeys,formUiCacheKey,normalizedFormUi,denormalizedFormUi,{eTag});return normalizedFormUi;}).catch(rejectionReason=>{const errMsg=`_normalizeAndStagePutFormUi() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}});}/**
         * Constructs and returns an Observable that will emit a form section ui for the given sectionName.
         * @param formSectionUiObservableKey The form section ui observable key identifying the form section ui observable.
         * @param formUiObservable The observable that emits a formUi object from which we will construct the particular form section ui object.
         * @param formApiName The form api name of the form for which the form section is a part.
         * @param formSectionApiName The section name of the section for which to create a form section ui object.
         * @param recordId The record id of the record to include as part of the form-section-ui.
         * @returns See description.
         */_constructFormSectionUiObservable(formSectionUiObservableKey,formUiObservable,formApiName,formSectionApiName,recordId){const formSectionUiObservable=formUiObservable.map(value=>{const formSectionUi=this._createFormSectionUiFromFormUi(value,formApiName,formSectionApiName,recordId);return formSectionUi;}).distinctUntilChanged((previousValue,newValue)=>{// Only allow new values to be emitted.
    return equivalent(previousValue,newValue);}).map(changedValue=>{// Map it to the read only value so consumers can't change stuff owned by the cache.
    if(changedValue===undefined){return changedValue;}return toReadOnly(changedValue);});// Subscribe to the new filtered observable so that when it completes (or errors) we know to remove the filtered observable from the map.
    formSectionUiObservable.subscribe({next:()=>{return;},error:()=>{this._formSectionUiObservables.delete(formSectionUiObservableKey.getKey());},complete:()=>{this._formSectionUiObservables.delete(formSectionUiObservableKey.getKey());}});// Decorate the subscribe method to return a Subscription instance with a decorated unsubscribe method which will dispose the filtered observable if
    // the subscriptions count drops below 1. (Not 0 because of the above subscription which will always be there but doesn't signify that
    // there is someone interested in this filtered observable externally.
    const formSectionUiObservables=this._formSectionUiObservables;const originalSubscribeFn=formSectionUiObservable.subscribe;formSectionUiObservable.subscribe=(observer,...args)=>{const originalSubscription=originalSubscribeFn.call(formSectionUiObservable,observer,...args);const originalSubscriptionUnsubscribeFn=originalSubscription.unsubscribe;originalSubscription.unsubscribe=()=>{originalSubscriptionUnsubscribeFn.call(originalSubscription);if(formSectionUiObservable.subscriptions.size<=1){formSectionUiObservables.delete(formSectionUiObservableKey.getKey());}};return originalSubscription;};return formSectionUiObservable;}/**
         * Returns a formSectionUi object crafted from the given formUi object for the given sectionName.
         * This object is NOT a deep clone from the given formUi.
         * @param formUi The formUi object from which to create the formSectionUi object.
         * @param formApiName The api name of the form.
         * @param sectionApiName The api name of the section for which to create the formSectionUi object.
         * @param recordId The record id of the record for the form.
         */_createFormSectionUiFromFormUi(formUi,formApiName,sectionApiName,recordId){// Shallow copy the formUi.
    // TODO: The way this code is written is not compatible with the types so an any type is used. We need to consider
    // a type safe way to build the new object, but this should be considered in another story
    // because it will have perf implications.
    const formSectionUi=Object.assign({},formUi);// Get the form specified by the form api name, get the form section specified by the section api name, and assign.
    const formSection=formUi.forms[formApiName].sections.find(value=>{return value.apiName===sectionApiName;});formSectionUi.formSection=Object.assign({},formSection);delete formSectionUi.forms;// Get the record specified by the record id, filter the fields, and assign.
    const fullRecord=formUi.records[recordId];const objectInfoForRecordAndLayout=formUi.objectInfos[fullRecord.apiName];const filteredRecordFields=this._getFieldApiNamesFromFormSection(formSectionUi.formSection,objectInfoForRecordAndLayout);const filteredRecord=recordServiceUtils.createFilteredRecordFromRecord(formSectionUi.records[recordId],filteredRecordFields);formSectionUi.record=filteredRecord;delete formSectionUi.records;// Filter the objectInfos.
    const objectInfoApiNamesForFormSection=this._getObjectApiNamesForFormSection(filteredRecordFields,formSectionUi.record.apiName,formSectionUi.objectInfos);const objectInfosForFormSection=objectInfoApiNamesForFormSection.reduce((accumulator,value)=>{accumulator[value]=formSectionUi.objectInfos[value];return accumulator;},{});formSectionUi.objectInfos=objectInfosForFormSection;return formSectionUi;}/**
         * Returns a set of field api names that are contained in the given form section.
         * @param formSection The FormSectionRepresentation object.
         * @param objectInfo The object info of the entity associated with the form.
         * @returns See description.
         */_getFieldApiNamesFromFormSection(formSection,objectInfo){const qualifiedFieldApiNames=new Set();for(let formSectionRowsLength=formSection.formSectionRows.length,formSectionRowsIndex=0;formSectionRowsIndex<formSectionRowsLength;++formSectionRowsIndex){const formRow=formSection.formSectionRows[formSectionRowsIndex];for(let formItemsLength=formRow.formItems.length,formItemsIndex=0;formItemsIndex<formItemsLength;++formItemsIndex){const formItem=formRow.formItems[formItemsIndex];for(let formSubitemsLength=formItem.formSubitems.length,formSubitemsIndex=0;formSubitemsIndex<formSubitemsLength;++formSubitemsIndex){const formSubitem=formItem.formSubitems[formSubitemsIndex];if(formSubitem.subitemType==="Field"){const formFieldSubitem=formSubitem;const spanningFieldName=objectInfo.fields[formFieldSubitem.apiName].relationshipName;if(spanningFieldName){// By default, include "Id" and "Name" fields on spanning records that are on the layout.
    qualifiedFieldApiNames.add(`${spanningFieldName}.Id`);qualifiedFieldApiNames.add(`${spanningFieldName}.Name`);}qualifiedFieldApiNames.add(`${formFieldSubitem.apiName}`);}}}}return collectionToArray(qualifiedFieldApiNames);}/**
         * Returns a list of the used object api names by the form section.
         * @param fields An array of the field api names in the form section.
         * @param formObjectApiName The object api name for the form.
         * @param objectInfos An object map of objectApiName -> objectInfo.
         * @returns See description.
         */_getObjectApiNamesForFormSection(fields,formObjectApiName,objectInfos){const objectInfo=objectInfos[formObjectApiName];const usedObjectApiNames=new Set();usedObjectApiNames.add(formObjectApiName);const fieldsWithoutSpanningFields=fields.filter(fieldApiName=>{// Filter out spanning fields.
    return !fieldApiName.includes(".");});for(let fieldsWithoutSpanningFieldsLength=fieldsWithoutSpanningFields.length,fieldsWithoutSpanningFieldsIndex=0;fieldsWithoutSpanningFieldsIndex<fieldsWithoutSpanningFieldsLength;++fieldsWithoutSpanningFieldsIndex){const fieldApiName=fieldsWithoutSpanningFields[fieldsWithoutSpanningFieldsIndex];const fieldRep=objectInfo.fields[fieldApiName];const referenceToInfos=fieldRep.referenceToInfos;for(let referenceToInfosLength=referenceToInfos.length,referenceToInfosIndex=0;referenceToInfosIndex<referenceToInfosLength;++referenceToInfosIndex){const referenceToInfo=referenceToInfos[referenceToInfosIndex];const usedObjectInfo=objectInfos[referenceToInfo.apiName];if(!usedObjectInfo){throw Error("Unable to find ObjectInfo "+referenceToInfo.apiName);}usedObjectApiNames.add(usedObjectInfo.apiName);}}return collectionToArray(usedObjectApiNames);}/** Helper method to kick off a refresh for a Form UI.
         * @param affectedKey The cache key for the Form UI to refresh.
         */_refreshFormUi(affectedKey){// When a record type changes in a record it can affect the form that should be present in the FormUi. Because of this for now we
    // do a full refresh of the FormUi.
    const keyBuilder=FormUiCacheKeyBuilder.fromCacheKey(affectedKey);const recordIds=keyBuilder.getRecordIds();const recordId=recordIds[0];const formApiNames=keyBuilder.getFormNames();const formApiName=formApiNames[0];// We need to refresh, but we're already in a cache transaction. Kick this to a Promise to get this out of the cache operation we're
    // already in the middle of.
    Promise.resolve().then(()=>{const forceProvide=true;const valueProvider=this._createFormUiValueProvider({cacheKey:affectedKey,recordId,formApiName,forceProvide});this._ldsCache.get(affectedKey,valueProvider);});}}/**
     * Transforms and returns the given aggregateUi representation into a FormUiRepresentation.
     * @param aggregateUi The instance of AggregateUiRepresentation to transform into a FormUiRepresentation.
     * @returns See description.
     */function transformAggregateUiRepresentationIntoFormUiRepresentation(aggregateUi){delete aggregateUi.layoutUserStates;delete aggregateUi.layouts;return aggregateUi;}/**
     * Wire adapter id: getFormSectionUi.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     */function getFormSectionUi(){throw generateError("getFormSectionUi");}/**
     * Generates the wire adapter for getFormSectionUi
     */class FormUiWireAdapterGenerator{/**
         * Constructor.
         * @param formUiService Reference to the FormUiService instance.
         */constructor(formUiService){this._formUiService=formUiService;}/**
         * Generates the wire adapter for @wire getFormSectionUi.
         * @returns Returns the generated wire adapter for getFormSectionUi
         */generateGetFormSectionUiWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetFormSectionUi.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Service getFormSectionUi @wire.
         * Can be called from an untyped context.
         * @param config Config params for the service.
         * @return Observable stream that emits a form section ui object.
         *
         * @private Public for testing purposes.
         */_serviceGetFormSectionUi(config){if(!config||!config.recordId||!config.formName||!config.sectionName){return undefined;}return this._formUiService.getFormSectionUi(config.formName,config.sectionName,config.recordId);}}/*
     * The valueType to use when building ListUiCacheKeyBuilder.
     */const LIST_UI_VALUE_TYPE="lds.ListUi";const LIST_INFO_VALUE_TYPE="lds.ListInfo";const LIST_RECORDS_VALUE_TYPE="lds.ListRecords";const LIST_VIEWS_VALUE_TYPE="lds.ListViews";// TTL for list collection related data
    const LIST_COLLECTION_TTL=30*1000;// 30 second ttl
    // TTL for list-ui related data
    const LIST_UI_TTL=15*60*1000;// 15 minute ttl
    // chunk size for caching list-records
    const DEFAULT_LIST_RECORDS_CHUNK_SIZE=25;// chunk size for caching list collections
    const DEFAULT_LIST_COLLECTION_CHUNK_SIZE=50;// listViewApiName to pass to getListUi() to request the MRU list
    const MRU=Symbol.for("MRU");// default page sizes if caller does not specify
    const DEFAULT_LIST_COLLECTION_PAGE_SIZE=20;const DEFAULT_LIST_RECORDS_PAGE_SIZE=50;// default page token if caller does not specify
    const DEFAULT_PAGE_TOKEN="0";// shared utility functions
    /**
     * String template for error messages.
     *
     * @param literals string literals from the template
     * @param key key for which the problem was detected
     * @param valueFound value that was supplied for key (if any)
     * @param singleValue existing value contained in list (?)
     * @return formatted error message
     */function _errorFormatter(literals,key,valueFound,singleValue){return `${key} should be a string list, but received ${valueFound}`+(singleValue?`, list contains an entry with value ${singleValue}`:"");}/**
     * Converts a list to a string suitable for inclusion in a CacheKey. The
     * list is not permitted to contain any null or undefined values.
     *
     * @param list list
     * @param key key associated with list, only used in case of errors
     * @return list, formatted as a string
     */function _listToString(list=[],key){// TODO - can be removed once all calling code is cleaned up to use undefined rather than null
    list=list||[];list.forEach(field=>{if(!field){throw new TypeError(_errorFormatter`${key}${list}${field}`);}});return list.join(",");}/**
     * Indicates if the supplied value is null or undefined.
     *
     * @param x value to be checked
     * @return true if x is null or undefined; false otherwise
     */function _nullish(x){return x===null||x===undefined;}/**
     * Converts a string from a CacheKey to a listViewApiName.
     *
     * @param s CacheKey string
     * @return listViewApiName associated with s
     */function _stringToListViewApiName(s){return s?s.startsWith("Symbol(")?Symbol.for(s.slice(7,-1)):s:undefined;}/**
     * Converts a string from a CacheKey to a list of strings.
     *
     * @param s CacheKey string
     * @return list of values that were used to generate s
     */function _stringToList(s){return s?s.split(","):undefined;}/**
     * Constructs a cache key for a list-info.
     */class ListInfoCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(LIST_INFO_VALUE_TYPE);}/**
         * Sets the objectApiName, listViewApiName, and listViewId for the list-info
         * CacheKey.
         *
         * @param objectApiName objectApiName for the list-info cache key
         * @param listViewApiName listViewApiName for the list-info cache key
         * @param listViewId listViewId for the list-info cache key
         * @returns the current object, to allow method chaining
         */setListReference(objectApiName,listViewApiName,listViewId){if(listViewId||objectApiName&&listViewApiName){this._objectApiName=objectApiName;this._listViewApiName=listViewApiName;this._listViewId=listViewId;}else{throw new TypeError(`Either objectApiName (${objectApiName}) AND listViewApiName (${String(listViewApiName)}) or listViewId (${listViewId}) must be set`);}return this;}/**
         * Sets the objectApiName, listViewApiName, and listViewId to match the corresponding
         * fields of a list-ui CacheKey.
         *
         * @param listUiCacheKey list-ui cache key to be copied
         * @returns the current object, to allow method chaining
         */setListUiCacheKey(listUiCacheKey){const pieces=listUiCacheKey.getLocalKey().split(KEY_DELIM,3);this._objectApiName=pieces[0];this._listViewApiName=_stringToListViewApiName(pieces[1]);this._listViewId=pieces[2];return this;}/**
         * Builds the cache key for a list-info.
         *
         * @returns a new cache key for a list-info
         */build(){return new CacheKey(this.getValueType(),`${this._objectApiName||""}${KEY_DELIM}${this._listViewApiName?this._listViewApiName.toString():""}${KEY_DELIM}${this._listViewId||""}`);}}/**
     * Constructs a cache key for a list-records.
     */class ListRecordsCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(LIST_RECORDS_VALUE_TYPE);}/**
         * Returns the fields associated with the list-records.
         *
         * @returns fields associated with the list-records
         */get fields(){return this._fields;}/**
         * Sets the fields for the list-records.
         *
         * @param fields fields for the list-records
         */set fields(fields){this.fields=fields;}/**
         * Sets the fields for the list-records.
         *
         * @param fields fields for the list-records
         * @returns the current object, to allow method chaining
         */setFields(fields){this._fields=fields;return this;}/**
         * Returns the listViewApiName associated with the list-records.
         *
         * @returns listViewApiName associated with the list-records
         */get listViewApiName(){return this._listViewApiName;}/**
         * Returns the listViewApiId associated with the list-records.
         *
         * @returns listViewApiId associated with the list-records
         */get listViewId(){return this._listViewId;}/**
         * Returns the objectApiName associated with the list-records.
         *
         * @returns objectApiName associated with the list-records
         */get objectApiName(){return this._objectApiName;}/**
         * Returns the optionalFields associated with the list-records.
         *
         * @returns optionalFields associated with the list-records
         */get optionalFields(){return this._optionalFields;}/**
         * Sets the optionalFields for the list-records.
         *
         * @param optionalFields optionalFields for the list-records
         */set optionalFields(optionalFields){this._optionalFields=optionalFields;}/**
         * Sets the optionalFields for the list-records.
         *
         * @param optionalFields optionalFields for the list-records
         * @returns the current object, to allow method chaining
         */setOptionalFields(optionalFields){this._optionalFields=optionalFields;return this;}/**
         * Returns the pageToken associated with the list-records.
         *
         * @returns pageToken associated with the list-records
         */get pageToken(){return this._pageToken;}/**
         * Sets the pageToken for the list-records.
         *
         * @param pagToken pageToken for the list-records
         */set pageToken(pageToken){this._pageToken=pageToken;}/**
         * Sets the pageToken for the list-records.
         *
         * @param pagToken pageToken for the list-records
         * @returns the current object, to allow method chaining
         */setPageToken(pageToken){this._pageToken=pageToken;return this;}/**
         * Returns the sortBy associated with the list-records.
         *
         * @returns sortBy associated with the list-records
         */get sortBy(){return this._sortBy;}/**
         * Sets the sortBy for the list-records.
         *
         * @param sortBy sortBy for the list-records
         */set sortBy(sortBy){this._sortBy=sortBy;}/**
         * Sets the sortBy for the list-records.
         *
         * @param sortBy sortBy for the list-records
         * @returns the current object, to allow method chaining
         */setSortBy(sortBy){this._sortBy=sortBy;return this;}/**
         * Sets the list reference fields (objectApiName, listViewApiName, and
         * listViewId) for this list-records. Note that either listViewId, or objectApiName
         * and listViewApiName must be supplied.
         *
         * @param objectApiName objectApiName to set
         * @param listViewApiName listViewApiName to set
         * @param listViewId listViewId to set
         * @returns the current object, to allow method chaining
         */setListReference(objectApiName,listViewApiName,listViewId){if(listViewId||objectApiName&&listViewApiName){this._objectApiName=objectApiName;this._listViewApiName=listViewApiName;this._listViewId=listViewId;}else{throw new TypeError(`Either objectApiName (${objectApiName}) AND listViewApiName (${String(listViewApiName)}) or listViewId (${listViewId}) must be set`);}return this;}/**
         * Sets the fields for this list-records cache key based on an existing list-records
         * cache key.
         *
         * @param cacheKey list-records cacheKey
         * @returns the current object, to allow method chaining
         */setListRecordsCacheKey(listRecordsCacheKey){const pieces=listRecordsCacheKey.getLocalKey().split(KEY_DELIM);this._objectApiName=pieces[0]||undefined;this._listViewApiName=_stringToListViewApiName(pieces[1]);this._listViewId=pieces[2]||undefined;this._pageToken=pieces[3]||undefined;this._sortBy=pieces[4]||undefined;this._fields=_stringToList(pieces[5]);this._optionalFields=_stringToList(pieces[6]);return this;}/**
         * Sets the fields for this list-records cache key based on an existing list-ui
         * cache key.
         *
         * @param cacheKey list-ui cacheKey
         * @returns the current object, to allow method chaining
         */setListUiCacheKey(listUiCacheKey){const pieces=listUiCacheKey.getLocalKey().split(KEY_DELIM);this._objectApiName=pieces[0]||undefined;this._listViewApiName=_stringToListViewApiName(pieces[1]);this._listViewId=pieces[2]||undefined;this._pageToken=pieces[3]||undefined;this._sortBy=pieces[5]||undefined;this._fields=_stringToList(pieces[6]);this._optionalFields=_stringToList(pieces[7]);return this;}/**
         * Builds the cache key for a list-records.
         *
         * @returns a new cache key for a list-records
         */build(){return new CacheKey(this.getValueType(),`${this._objectApiName||""}${KEY_DELIM}${this._listViewApiName?this._listViewApiName.toString():""}${KEY_DELIM}${this._listViewId||""}${KEY_DELIM}${_nullish(this._pageToken)?DEFAULT_PAGE_TOKEN:this._pageToken}${KEY_DELIM}${this._sortBy||""}${KEY_DELIM}${_listToString(this._fields,"fields")}${KEY_DELIM}${_listToString(this._optionalFields,"optionalFields")}`);}}/**
     * Constructs a cache key for a list-ui.
     */class ListUiCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(LIST_UI_VALUE_TYPE);}/**
         * Returns the fields associated with the list-ui.
         *
         * @returns fields associated with the list-ui
         */get fields(){return this._fields;}/**
         * Sets the fields for the list-ui.
         *
         * @param fields fields for the list-ui
         */set fields(fields){this._fields=fields;}/**
         * Sets the fields for the list-ui.
         *
         * @param fields fields for the list-ui
         * @returns the current object, to allow method chaining
         */setFields(fields){this._fields=fields;return this;}/**
         * Returns the listViewApiName associated with the list-ui.
         *
         * @returns listViewApiName associated with the list-ui
         */get listViewApiName(){return this._listViewApiName;}/**
         * Returns the listViewApiId associated with the list-ui.
         *
         * @returns listViewApiId associated with the list-ui
         */get listViewId(){return this._listViewId;}/**
         * Returns the objectApiName associated with the list-ui.
         *
         * @returns objectApiName associated with the list-ui
         */get objectApiName(){return this._objectApiName;}/**
         * Returns the optionalFields associated with the list-ui.
         *
         * @returns optionalFields associated with the list-ui
         */get optionalFields(){return this._optionalFields;}/**
         * Sets the optionalFields for the list-ui.
         *
         * @param optionalFields optionalFields for the list-ui
         */set optionalFields(optionalFields){this._optionalFields=optionalFields;}/**
         * Sets the optionalFields for the list-ui.
         *
         * @param optionalFields optionalFields for the list-ui
         * @returns the current object, to allow method chaining
         */setOptionalFields(optionalFields){this._optionalFields=optionalFields;return this;}/**
         * Returns the pageSize associated with the list-ui.
         *
         * @returns pageSize associated with the list-ui
         */get pageSize(){return this._pageSize;}/**
         * Sets the pageSize for the list-ui.
         *
         * @param pagSize pageSize for the list-ui
         */set pageSize(pageSize){this._pageSize=pageSize;}/**
         * Sets the pageSize for the list-ui.
         *
         * @param pagSize pageSize for the list-ui
         * @returns the current object, to allow method chaining
         */setPageSize(pageSize){this._pageSize=pageSize;return this;}/**
         * Returns the pageToken associated with the list-ui.
         *
         * @returns pageToken associated with the list-ui
         */get pageToken(){return this._pageToken;}/**
         * Sets the pageToken for the list-ui.
         *
         * @param pagToken pageToken for the list-ui
         */set pageToken(pageToken){this._pageToken=pageToken;}/**
         * Sets the pageToken for the list-ui.
         *
         * @param pagToken pageToken for the list-ui
         * @returns the current object, to allow method chaining
         */setPageToken(pageToken){this._pageToken=pageToken;return this;}/**
         * Returns the sortBy associated with the list-ui.
         *
         * @returns sortBy associated with the list-ui
         */get sortBy(){return this._sortBy;}/**
         * Sets the sortBy for the list-ui.
         *
         * @param sortBy sortBy for the list-ui
         */set sortBy(sortBy){this._sortBy=sortBy;}/**
         * Sets the sortBy for the list-ui.
         *
         * @param sortBy sortBy for the list-ui
         * @returns the current object, to allow method chaining
         */setSortBy(sortBy){this._sortBy=sortBy;return this;}/**
         * Sets the list reference fields (objectApiName, listViewApiName, and
         * listViewId) for this list-ui. Note that either listViewId, or objectApiName
         * and listViewApiName must be supplied.
         *
         * @param objectApiName objectApiName to set
         * @param listViewApiName listViewApiName to set
         * @param listViewId listViewId to set
         * @returns the current object, to allow method chaining
         */setListReference(objectApiName,listViewApiName,listViewId){if(listViewId||objectApiName&&listViewApiName){this._objectApiName=objectApiName;this._listViewApiName=listViewApiName;this._listViewId=listViewId;}else{throw new TypeError(`Either objectApiName (${objectApiName}) AND listViewApiName (${String(listViewApiName)}) or listViewId (${listViewId}) must be set`);}return this;}/**
         * Sets the fields for this list-ui cache key based on an existing list-ui
         * cache key.
         *
         * @param cacheKey list-ui cacheKey
         * @returns the current object, to allow method chaining
         */setListUiCacheKey(listUiCacheKey){const pieces=listUiCacheKey.getLocalKey().split(KEY_DELIM);this._objectApiName=pieces[0]||undefined;this._listViewApiName=_stringToListViewApiName(pieces[1]);this._listViewId=pieces[2]||undefined;this._pageToken=pieces[3]||undefined;this._pageSize=pieces[4]?parseInt(pieces[4],10):DEFAULT_LIST_RECORDS_PAGE_SIZE;this._sortBy=pieces[5]||undefined;this._fields=_stringToList(pieces[6]);this._optionalFields=_stringToList(pieces[7]);return this;}/**
         * Builds the cache key for a list-ui.
         *
         * @returns a new cache key for a list-ui
         */build(){return new CacheKey(this.getValueType(),`${this._objectApiName||""}${KEY_DELIM}${this._listViewApiName?this._listViewApiName.toString():""}${KEY_DELIM}${this._listViewId||""}${KEY_DELIM}${_nullish(this._pageToken)?DEFAULT_PAGE_TOKEN:this._pageToken}${KEY_DELIM}${this._pageSize}${KEY_DELIM}${this._sortBy||""}${KEY_DELIM}${_listToString(this._fields,"fields")}${KEY_DELIM}${_listToString(this._optionalFields,"optionalFields")}`);}}/**
     * Constructs a cache key for a list collection.
     */class ListCollectionCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(LIST_VIEWS_VALUE_TYPE);}/**
         * Returns the objectApiName associated with the list collection.
         *
         * @returns objectApiName associated with the list collection
         */get objectApiName(){return this._objectApiName;}/**
         * Sets the objectApiName of the list collection.
         *
         * @param objectApiName objectApiName associated with the list collection
         */set objectApiName(objectApiName){this._objectApiName=objectApiName;}/**
         * Sets the objectApiName of the list collection.
         *
         * @param objectApiName objectApiName associated with the list collection
         * @returns the current object, to allow method chaining
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Returns the pageSize associated with the list collection.
         *
         * @returns pageSize associated with the list collection
         */get pageSize(){return this._pageSize;}/**
         * Sets the pageSize for the list collection.
         *
         * @param pagSize pageSize for the list collection
         */set pageSize(pageSize){this._pageSize=pageSize;}/**
         * Sets the pageSize for the list collection.
         *
         * @param pagSize pageSize for the list collection
         * @returns the current object, to allow method chaining
         */setPageSize(pageSize){this._pageSize=pageSize;return this;}/**
         * Returns the pageToken associated with the list collection.
         *
         * @returns pageToken associated with the list collection
         */get pageToken(){return this._pageToken;}/**
         * Sets the pageToken for the list collection.
         *
         * @param pagToken pageToken for the list collection
         */set pageToken(pageToken){this._pageToken=pageToken;}/**
         * Sets the pageToken for the list collection.
         *
         * @param pagToken pageToken for the list collection
         * @returns the current object, to allow method chaining
         */setPageToken(pageToken){this._pageToken=pageToken;return this;}/**
         * Returns the query associated with the list collection.
         *
         * @returns query associated with the list collection
         */get q(){return this._q;}/**
         * Sets the query for the list collection.
         *
         * @param q query for the list collection
         */set q(q){this._q=q;}/**
         * Sets the query for the list collection.
         *
         * @param q query for the list collection
         * @returns the current object, to allow method chaining
         */setQ(q){this._q=q;return this;}/**
         * Copies an existing list collection cache key.
         * Note that by default we do NOT copy pageSize as we don't want it when
         * searching for cached list views.
         *
         * @param cacheKey existing list collection cache key
         * @param copyPageSize if truthy, copy pageSize; otherwise set pageSize of this
         *   cache key to undefined
         * @returns the current object, to allow method chaining
         */setListCollectionCacheKey(cacheKey,copyPageSize=false){// TODO - should we assert cacheKey is LIST_VIEWS_VALUE_TYPE?
    const pieces=cacheKey.getLocalKey().split(KEY_DELIM);this._objectApiName=pieces[0];this._pageToken=pieces[1];this._pageSize=copyPageSize&&pieces[2]?parseInt(pieces[2],10):undefined;this._q=pieces[3]||undefined;return this;}/**
         * Builds the cache key for a list collection.
         *
         * @returns a new cache key for a list collection
         */build(){return new CacheKey(this.getValueType(),`${this._objectApiName}${KEY_DELIM}${_nullish(this._pageToken)?DEFAULT_PAGE_TOKEN:this._pageToken}${KEY_DELIM}${this._pageSize||""}${KEY_DELIM}${this._q||""}`);}}/**
     * Cache utilities that deal with list-ui, list-info, and list-records
     * data in the LDS cache.
     */ // fetch functions
    /**
     * Fetches a list collection from the server.
     *
     * @param cacheKey cache key for the list collection to be retrieved
     * @param pageSize pageSize for the list collection
     * @return raw list collection data
     */function fetchListCollection(cacheKey,pageSize){const listCollectionCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(cacheKey);const params={objectApiName:listCollectionCacheKeyBuilder.objectApiName,pageToken:listCollectionCacheKeyBuilder.pageToken,pageSize,q:listCollectionCacheKeyBuilder.q};if(params.pageToken===DEFAULT_PAGE_TOKEN){delete params.pageToken;}if(!params.q){delete params.q;}return executeAuraGlobalController("ListUiController.getListsByObjectName",params).then(response=>{if(response.status===200){return response.body;}throw response.statusText;});}/**
     * Fetches a list-records from the server.
     *
     * @param cacheKey cache key for the list-records to be retrieved
     * @param pageSize pageSize for the list-records
     * @return raw list-records, as returned by the server
     */function fetchListRecords(cacheKey,pageSize){const listRecordsCacheKeyBuilder=new ListRecordsCacheKeyBuilder().setListRecordsCacheKey(cacheKey);const params={pageToken:listRecordsCacheKeyBuilder.pageToken,pageSize,sortBy:listRecordsCacheKeyBuilder.sortBy,fields:listRecordsCacheKeyBuilder.fields,optionalFields:listRecordsCacheKeyBuilder.optionalFields};let method;if(listRecordsCacheKeyBuilder.listViewId){params.listViewId=listRecordsCacheKeyBuilder.listViewId;method="ListUiController.getListRecordsById";}else if(listRecordsCacheKeyBuilder.listViewApiName===MRU){params.objectApiName=listRecordsCacheKeyBuilder.objectApiName;method="MruListUiController.getMruListRecords";}else{params.objectApiName=listRecordsCacheKeyBuilder.objectApiName;params.listViewApiName=listRecordsCacheKeyBuilder.listViewApiName;method="ListUiController.getListRecordsByName";}if(!params.fields){delete params.fields;}if(!params.optionalFields){delete params.optionalFields;}if(params.pageToken===DEFAULT_PAGE_TOKEN){delete params.pageToken;}if(!params.sortBy){delete params.sortBy;}return executeAuraGlobalController(method,params).then(response=>{if(response.status===200){return response.body;}throw response.statusText;});}/**
     * Fetches a list-ui from the server.
     *
     * @param cacheKey cache key for list-ui to be retrieved
     * @return raw list-ui, as returned by the server
     */function fetchListUi(cacheKey){const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(cacheKey);const params={pageToken:listUiCacheKeyBuilder.pageToken,pageSize:listUiCacheKeyBuilder.pageSize,sortBy:listUiCacheKeyBuilder.sortBy,fields:listUiCacheKeyBuilder.fields,optionalFields:listUiCacheKeyBuilder.optionalFields};let method;if(listUiCacheKeyBuilder.listViewId){params.listViewId=listUiCacheKeyBuilder.listViewId;method="ListUiController.getListUiById";}else if(listUiCacheKeyBuilder.listViewApiName===MRU){params.objectApiName=listUiCacheKeyBuilder.objectApiName;method="MruListUiController.getMruListUi";}else{params.objectApiName=listUiCacheKeyBuilder.objectApiName;params.listViewApiName=listUiCacheKeyBuilder.listViewApiName;method="ListUiController.getListUiByName";}if(!params.fields){delete params.fields;}if(!params.optionalFields){delete params.optionalFields;}if(params.pageToken===DEFAULT_PAGE_TOKEN){delete params.pageToken;}if(!params.sortBy){delete params.sortBy;}return executeAuraGlobalController(method,params).then(response=>{if(response.status===200){return response.body;}throw response.statusText;});}// pageToken functions
    /**
     * Converts a record offset to the corresponding pageToken.
     *
     * @param offset offset
     * @returns pageToken
     */function offsetToPageToken(offset){return String(offset);}/**
     * Returns the pageTokens and urls for a given pageToken/pageSize.
     *
     * @param pageToken page token
     * @param pageSize page size
     * @param endOfData true-ish if this is the end of the data
     * @param sampleUrl sample url to use as a pattern for constructing returned urls
     * @return (current|previous|next)Page(Token|Url)
     */function pageTokensAndUrls(pageToken,pageSize,endOfData,sampleUrl){const offset=pageTokenToOffset(pageToken);const previousOffset=offset===0?null:Math.max(offset-pageSize,0);const nextOffset=endOfData?null:offset+pageSize;const urlFor=(_offset,size)=>{return _offset===null?null:sampleUrl.replace(/([&?]pageToken=)[^&+]/,`$1${offsetToPageToken(_offset)}`).replace(/([&?]pageSize=)\d+/,`$1${size}`);};return {currentPageToken:pageToken||offsetToPageToken(offset),currentPageUrl:urlFor(offset,pageSize),previousPageToken:previousOffset===null?null:offsetToPageToken(previousOffset),previousPageUrl:urlFor(previousOffset,pageSize),nextPageToken:nextOffset===null?null:offsetToPageToken(nextOffset),nextPageUrl:urlFor(nextOffset,pageSize)};}/**
     * Parses a pageToken and returns the corresponding record offset.
     *
     * @param pageToken page token
     * @return record offset associated with the pageToken
     */function pageTokenToOffset(pageToken){return parseInt(pageToken||DEFAULT_PAGE_TOKEN,10);}// chunk functions
    /**
     * Returns the pageTokens for the chunks that encompass the specified pageToken
     * and pageSize.
     *
     * @param pageToken page token
     * @param pageSize page size
     * @param chunkSize chunk size
     * @return pageTokens for the chunks, offset of original pageToken within the first chunk
     */function chunkPageTokensFor(pageToken,pageSize,chunkSize){let offset;[pageToken,pageSize,offset]=snapToChunkBoundaries(pageToken,pageSize,chunkSize);const pageTokens=[];while(pageSize>0){pageTokens.push(pageToken);pageSize-=chunkSize;pageToken=offsetToPageToken(pageTokenToOffset(pageToken)+chunkSize);}return [pageTokens,offset];}/**
     * Adjusts a pageToken & pageSize so that both are aligned on cache chunk
     * boundaries.
     *
     * @param pageToken initial pageToken
     * @param pageSize initial pageSize
     * @param chunkSize chunk size
     * @return adjusted pageToken, adjusted pageSize, offset of new pageToken relative to old pageToken
     */function snapToChunkBoundaries(pageToken,pageSize,chunkSize){const offset=pageTokenToOffset(pageToken);// round pageToken down to the nearest chunk boundary
    const offsetAdjustment=offset%chunkSize;// round pageSize up to the nearest chunk boundary
    pageSize=chunkSize*Math.ceil((pageSize+offsetAdjustment)/chunkSize);return [offsetToPageToken(offset-offsetAdjustment),pageSize,offsetAdjustment];}/**
     */class ListUiCacheUtils{constructor(cacheAccessor,{chunkSize,ttl}){this.cacheAccessor=cacheAccessor;this.chunkSize=chunkSize;this.ttl=ttl;}/**
         * Locates as many list collections as possible from the LDS cache for the specified
         * cache key and returns the associated ValueWrappers for them.
         *
         * @param listCollectionCacheKey CacheKey that describes the list views to be retrieved
         * @return ValueWrapper[] for the list views found in the cache, the CacheKeys for those
         *    ValueWrappers, and the offset of the first list view within ValueWrapper[0]. Note
         *    that the ValueWrapper array may contain undefined and/or expired entries.
         */collectCachedLists(listCollectionCacheKey){const listCollectionCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(listCollectionCacheKey,true);const[pageTokens,offset]=chunkPageTokensFor(listCollectionCacheKeyBuilder.pageToken,listCollectionCacheKeyBuilder.pageSize,this.chunkSize);// we don't want a pageSize in the constituent keys
    listCollectionCacheKeyBuilder.setPageSize(undefined);const listCollectionCacheKeys=pageTokens.map(pageToken=>listCollectionCacheKeyBuilder.setPageToken(pageToken).build());const listCollectionThenables=listCollectionCacheKeys.map(cacheKey=>this.cacheAccessor.get(cacheKey));return Thenable.all(listCollectionThenables).then(valueWrappers=>[valueWrappers,listCollectionCacheKeys,offset]);}/**
         * Locates as many list-records as possible from the LDS cache for the specified list-ui
         * and returns the associated ValueWrappers for them.
         *
         * @param listUiCacheKey CacheKey that describes the records to be retrieved
         * @return ValueWrapper[] for the list-records found in the cache, the CacheKeys for those
         *    ValueWrappers, and the offset of the first record within ValueWrapper[0]. Note
         *    that the ValueWrapper array may contain undefined and/or expired entries.
         */collectCachedRecords(listUiCacheKey){const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(listUiCacheKey);const[pageTokens,offset]=chunkPageTokensFor(listUiCacheKeyBuilder.pageToken,listUiCacheKeyBuilder.pageSize,this.chunkSize);const listRecordsCacheKeyBuilder=new ListRecordsCacheKeyBuilder().setListUiCacheKey(listUiCacheKey);const listRecordsCacheKeys=pageTokens.map(pageToken=>listRecordsCacheKeyBuilder.setPageToken(pageToken).build());const listRecordsThenables=listRecordsCacheKeys.map(listRecordsCacheKey=>this.cacheAccessor.get(listRecordsCacheKey));return Thenable.all(listRecordsThenables).then(valueWrappers=>[valueWrappers,listRecordsCacheKeys,offset]);}/**
         * Fabricates a list collection from its pieces.
         *
         * @param listCollectionValueWrappers ValueWrappers contianing the list data
         * @param offset offset of the first list view within the first list-collection
         * @param listCollectionCacheKey CacheKey for the list-collection
         * @return the assembled list collection
         */constructListCollection(listCollectionValueWrappers,offset,listCollectionCacheKey){const listCollectionCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(listCollectionCacheKey,true);// assemble the list data
    let remaining=listCollectionCacheKeyBuilder.pageSize;let endOfData=true;const lists=[].concat(...listCollectionValueWrappers.map(listCollectionValueWrapper=>{const listCollection=listCollectionValueWrapper.value;const count=Math.min(listCollection.lists.length-offset,remaining);const listData=listCollection.lists.slice(offset,offset+count);// we've reached the end of the data if we used all these records and there aren't any more
    endOfData=offset+count>=listCollection.lists.length&&!listCollection.nextPageToken;offset=0;remaining-=count;return listData;}));const samplePageUrl=listCollectionValueWrappers[0].value.currentPageUrl;const{currentPageToken,currentPageUrl,previousPageToken,previousPageUrl,nextPageToken,nextPageUrl}=pageTokensAndUrls(listCollectionCacheKeyBuilder.pageToken,listCollectionCacheKeyBuilder.pageSize,endOfData,samplePageUrl);// put everything together
    return {count:lists.length,lists,currentPageToken,currentPageUrl,previousPageToken,previousPageUrl,nextPageToken,nextPageUrl};}/**
         * Fabricates a list-ui from its pieces
         *
         * @param recordService The recordService instance.
         * @param listInfoValueWrapper the list-info
         * @param listRecordsValueWrappers the list-records
         * @param offset offset of the first record within the first list-records
         * @param listUiCacheKey CacheKey for the list-ui
         * @return the list-ui
         */constructListUi(recordService,listInfoValueWrapper,listRecordsValueWrappers,offset,listUiCacheKey){const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(listUiCacheKey);// start with a copy of the list-info
    const info=cloneDeepCopy(listInfoValueWrapper.value);// we're hiding etags from consumers
    delete info.eTag;// expand the markers back into records
    let remaining=listUiCacheKeyBuilder.pageSize;let endOfData=true;const thenables=listRecordsValueWrappers.map(valueWrapper=>{const listRecords=valueWrapper.value;const count=Math.min(listRecords.records.length-offset,remaining);const markers=listRecords.records.slice(offset,offset+count);// we've reached the end of the data if we used all these records and there aren't any more
    endOfData=offset+count>=listRecords.records.length&&!listRecords.nextPageToken;offset=0;remaining-=count;return recordMarkerResolver.fromRecordMarkers(recordService,this.cacheAccessor,markers);});const{currentPageToken,currentPageUrl,previousPageToken,previousPageUrl,nextPageToken,nextPageUrl}=pageTokensAndUrls(listUiCacheKeyBuilder.pageToken,listUiCacheKeyBuilder.pageSize,endOfData,listRecordsValueWrappers[0].value.currentPageUrl);// add the records to the list-ui
    return Thenable.all(thenables).then(records=>{const listUi={info,records:{count:0,currentPageToken,currentPageUrl,previousPageToken,previousPageUrl,nextPageToken,nextPageUrl,records:[].concat(...records)}};listUi.records.count=listUi.records.records.length;return listUi;});}/**
         * Indicates if a ValueWrapper from the LDS cache is expired.
         *
         * @param valueWrapper value from the LDS cache to be checked
         * @param ttl maximum age, in millisecondss; if a ttl <= 0 is specified the ttl check is skipped
         * @return truthy if value is expired; falsy if not
         */expired(valueWrapper,ttl=this.ttl){return !valueWrapper||valueWrapper.value===undefined||!valueWrapper.extraInfoObject||ttl>0&&this.cacheAccessor.nowTime>valueWrapper.extraInfoObject.serverFetchTime+ttl;}/**
         * Fetches list views from the server and stagePuts the data. Note that this method
         * adjusts the starting pageToken and pageSize so that complete chunks of list views are
         * retrieved.
         *
         * @param listCollectionCacheKey CacheKey describing the list views to be retrieved
         * @param pageSize number of list views to be retrieved
         * @return list-collection ValueWrappers, CacheKeys, offset of the first list view within the
         *    first ValueWrapper
         */fetchAndStagePutListCollection(listCollectionCacheKey,pageSize){const listCollectionCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(listCollectionCacheKey);// adjust pageToken & pageSize so that we ask for full chunks of records
    let offset;[listCollectionCacheKeyBuilder.pageToken,pageSize,offset]=snapToChunkBoundaries(listCollectionCacheKeyBuilder.pageToken,pageSize,this.chunkSize);offset+=0;// eslint is retarded
    listCollectionCacheKey=listCollectionCacheKeyBuilder.build();return fetchListCollection(listCollectionCacheKey,pageSize).then(listCollection=>{return this.stagePutListCollections(listCollectionCacheKey,listCollection);}).then(([listCollectionValueWrappers,listCollectionCacheKeys])=>{// type inference thinks this is any[] - need to be explicit
    return [listCollectionValueWrappers,listCollectionCacheKeys,offset];});}/**
         * Fetches a list-records from the server and stagePuts its data. Note that this method
         * adjusts the starting pageToken and pageSize so that complete chunks of records are
         * retrieved.
         *
         * @param recordService Reference to RecordService for stage putting records
         * @param listRecordsCacheKey CacheKey describing the records to be retrieved
         * @param pageSize number of records to be retrieved
         * @return list-records ValueWrappers, list-records CacheKeys, offset of the first record
         *    within the first ValueWrapper
         */fetchAndStagePutListRecords(recordService,listRecordsCacheKey,pageSize){const listRecordsCacheKeyBuilder=new ListRecordsCacheKeyBuilder().setListRecordsCacheKey(listRecordsCacheKey);// adjust pageToken & pageSize so that we ask for full chunks of records
    let offset;[listRecordsCacheKeyBuilder.pageToken,pageSize,offset]=snapToChunkBoundaries(listRecordsCacheKeyBuilder.pageToken,pageSize,this.chunkSize);listRecordsCacheKey=listRecordsCacheKeyBuilder.build();return fetchListRecords(listRecordsCacheKey,pageSize).then(listRecords=>{// split the records into chunks & add them to the LDS cache
    // note that we make an assumption here that these will not be the only list-records
    // in the cache so we don't need to force a stagePut - this is true most of the time
    // but can break in certain edge-case scenarios, e.g. the list-records from a previous
    // list-ui have expired but the list-info hasn't, or someone previously requested a
    // list-ui with 0 records
    return this.stagePutListRecords(recordService,listRecordsCacheKey,listRecords,false);}).then(([listRecordsValueWrappers,listRecordsCacheKeys])=>{// type inference thinks this is any[] - need to be explicit
    return [listRecordsValueWrappers,listRecordsCacheKeys,offset];});}/**
         * Fetches a list-ui from the server and stagePuts its constituent pieces.
         * Note that the list-ui itself is discarded.
         *
         * @param recordService Reference to RecordService for stage putting records.
         * @param listUiCacheKey CacheKey of the list-ui to be retrieved
         * @return list-info ValueWrapper, list-records ValueWrappers, list-records CacheKeys, offset
         *    of first record within first ValueWrapper
         */fetchAndStagePutListUi(recordService,listUiCacheKey){const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(listUiCacheKey);// adjust pageToken & pageSize so that we ask for full chunks of records
    let offset;[listUiCacheKeyBuilder.pageToken,listUiCacheKeyBuilder.pageSize,offset]=snapToChunkBoundaries(listUiCacheKeyBuilder.pageToken,listUiCacheKeyBuilder.pageSize,this.chunkSize);offset+=0;// eslint is retarded
    listUiCacheKey=listUiCacheKeyBuilder.build();return fetchListUi(listUiCacheKey).then(listUi=>{// extract and cache the list-ui
    const listInfoCacheKey=new ListInfoCacheKeyBuilder().setListUiCacheKey(listUiCacheKey).build();const listInfoValueWrapper=this.cacheAccessor.newValueWrapper(listUi.info,listUi.info.eTag,{serverFetchTime:this.cacheAccessor.nowTime});this.cacheAccessor.stagePut([],listInfoCacheKey,listInfoValueWrapper,listUi.info);// split the list-records into chunks and add them to the cache
    const listRecordsCacheKey=new ListRecordsCacheKeyBuilder().setListUiCacheKey(listUiCacheKey).build();// note that if we've fetched a list-ui, this are almost certainly the only records
    // in the cache so we force a stagePut
    // nested then's are gross, but this one is needed for scope
    return this.stagePutListRecords(recordService,listRecordsCacheKey,listUi.records,true).then(([listRecordsValueWrappers,listRecordsCacheKeys])=>{// note that we do NOT cache the list-ui itself since it doesn't contain any interesting data;
    // we'll just construct a new list-ui from the cached list-info and list-records when we need it
    // type inference thinks this is any[] - need to be explicit
    return [listInfoValueWrapper,listRecordsValueWrappers,listRecordsCacheKeys,offset];});});}/**
         * Computes the effective server fetch time for a constructed list artifact,
         * stagePuts it to the LDS cache, and sets up the LDS cache dependencies for it.
         *
         * @param artifactCacheKey CacheKey for the list artifact
         * @param artifact the data to be stored in the cache
         * @param valueWrappers the ValueWrappers that were used to construct the artifact; used to
         *    compute the effective fetch time
         * @param cacheKeys CacheKeys on which the artifact depends
         */stagePutListArtifact(artifactCacheKey,artifact,valueWrappers,cacheKeys){const oldestFetchTime=valueWrappers.reduce((oldest,valueWrapper)=>{const serverFetchTime=valueWrapper.extraInfoObject?valueWrapper.extraInfoObject.serverFetchTime:oldest;return Math.min(oldest,serverFetchTime);},this.cacheAccessor.nowTime);const artifactValueWrapper=this.cacheAccessor.newValueWrapper({},undefined,{serverFetchTime:oldestFetchTime});this.cacheAccessor.stagePut([],artifactCacheKey,artifactValueWrapper,artifact);cacheKeys.forEach(cacheKey=>this.cacheAccessor.stageDependencies([artifactCacheKey],cacheKey));}/**
         * Breaks a collection of list views into chunks and stagePuts them to the
         * LDS cache.
         *
         * @param listCollectionCacheKey CacheKey for the list collection
         * @param listCollection list collection as returned from the UI API
         * @return ValueWrappers and associated CacheKeys used to stagePut the list views
         */stagePutListCollections(listCollectionCacheKey,listCollection){const offset=pageTokenToOffset(listCollection.currentPageToken);{assert$1(offset%this.chunkSize===0,"list-collection must start on a chunk boundary");}const chunkCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(listCollectionCacheKey);const valueWrappers=[];const cacheKeys=[];// always stagePut at least one list collection, even if it is empty; this
    // is necessary to correctly keep track of collections with no lists
    let forceStagePut=true;for(let i=0;i<listCollection.count||forceStagePut;i+=this.chunkSize){// only force one stagePut
    forceStagePut=false;const chunkCacheKey=chunkCacheKeyBuilder.setPageToken(offsetToPageToken(offset+i)).build();const lists=listCollection.lists.slice(i,i+this.chunkSize);const chunkListCollection={// we'll use this url as a template for constructing urls to return to our callers - the
    // pageToken and pageSize values will be replaced so it's not important that they're correct
    currentPageUrl:listCollection.currentPageUrl,// used both to mark the end of the data & when fetching more records
    nextPageToken:i+this.chunkSize>=listCollection.count?listCollection.nextPageToken:offsetToPageToken(offset+i+this.chunkSize),lists,count:lists.length};const chunkValueWrapper=this.cacheAccessor.newValueWrapper(chunkListCollection,undefined,{serverFetchTime:this.cacheAccessor.nowTime});this.cacheAccessor.stagePut([],chunkCacheKey,chunkValueWrapper,chunkListCollection);valueWrappers.push(chunkValueWrapper);cacheKeys.push(chunkCacheKey);}// type inference doesn't do what we want here - need to be explicit
    return Thenable.resolve([valueWrappers,cacheKeys]);}/**
         * stagePuts a list-records
         *
         * @param recordService Reference to RecordService used for stage putting records.
         * @param listRecordsCacheKey CacheKey for the list-records
         * @param listRecords list-records data
         * @param forceStagePut if true always stagePut a list-records, even if it is empty; this is necessary
         *    to correctly keep track of lists with no records
         * @return ValueWrappers and associated CacheKeys used to stagePut the list-records
         */stagePutListRecords(recordService,listRecordsCacheKey,listRecords,forceStagePut){const offset=pageTokenToOffset(listRecords.currentPageToken);{assert$1(offset%this.chunkSize===0,"list-records must start on a chunk boundary");}const chunkCacheKeyBuilder=new ListRecordsCacheKeyBuilder().setListRecordsCacheKey(listRecordsCacheKey);const thenables=[];const valueWrappers=[];const cacheKeys=[];for(let i=0;i<listRecords.count||forceStagePut;i+=this.chunkSize){// only force one stagePut
    forceStagePut=false;const records=listRecords.records.slice(i,i+this.chunkSize);const chunkCacheKey=chunkCacheKeyBuilder.setPageToken(offsetToPageToken(offset+i)).build();// clear any dependencies from this chunk to previous records
    this.cacheAccessor.stageClearDependencies(chunkCacheKey);// lds-records owns record data, so let them merge our record data with whatever they already have
    thenables.push(recordService.mergeRecordsAndStagePuts([chunkCacheKey],records,this.cacheAccessor,true));const chunkListRecords={// we need the etag to match up later
    listInfoETag:listRecords.listInfoETag,// we'll use this url as a template for constructing urls to return to our callers - the
    // pageToken and pageSize values will be replaced so it's not important that they're correct
    currentPageUrl:listRecords.currentPageUrl,// used both to mark the end of the data & when fetching more records
    nextPageToken:i+this.chunkSize>=listRecords.count?listRecords.nextPageToken:offsetToPageToken(offset+i+this.chunkSize),// defer to lds-records for record data when this is pulled back out of the cache
    records:records.map(record=>recordMarkerUtils.toRecordMarker(this.cacheAccessor,record,0))};const chunkValueWrapper=this.cacheAccessor.newValueWrapper(chunkListRecords,undefined,{serverFetchTime:this.cacheAccessor.nowTime});this.cacheAccessor.stagePut([],chunkCacheKey,chunkValueWrapper,chunkListRecords);valueWrappers.push(chunkValueWrapper);cacheKeys.push(chunkCacheKey);}// type inference doesn't do what we want here - need to be explicit
    return Thenable.all(thenables).then(()=>[valueWrappers,cacheKeys]);}}/**
     * Provider function for list-uis.
     *
     * @param cacheAccessor accessor to get to the LDS cache
     * @param parameters parameters indicating what value is to be returned;
     * @returns provide result
     */function provide(cacheAccessor,parameters){const cacheUtils=new ListUiCacheUtils(cacheAccessor,{chunkSize:parameters.chunkSize,ttl:parameters.ttl});return cacheAccessor.get(parameters.listUiCacheKey).then(listUiValueWrapper=>{// if we already have a value & it's not expired then we're done
    if(!cacheUtils.expired(listUiValueWrapper,parameters.ttl)){return ValueProviderResult.CACHE_HIT;}// cache value was missing or too old, see which pieces we do have
    let valueWrappers;let cacheKeys;// see if we have the list-info
    const listInfoCacheKey=new ListInfoCacheKeyBuilder().setListUiCacheKey(parameters.listUiCacheKey).build();return cacheAccessor.get(listInfoCacheKey).then(listInfoValueWrapper=>{if(cacheUtils.expired(listInfoValueWrapper)){return cacheUtils.fetchAndStagePutListUi(parameters.recordService,parameters.listUiCacheKey);}return cacheUtils.collectCachedRecords(parameters.listUiCacheKey).then(([listRecordsValueWrappers,listRecordsCacheKeys,offset])=>{// toss out all the list-records at or past the first expired one
    const firstExpired=listRecordsValueWrappers.findIndex(valueWrapper=>cacheUtils.expired(valueWrapper));if(firstExpired>=0){listRecordsValueWrappers.splice(firstExpired);listRecordsCacheKeys.splice(firstExpired);}// If any of the list-records don't match the list-info then just reload everything.
    // In theory it might be possible to save/reuse some of the list-records, but this
    // should be rare & the logic would be complex.
    if(listRecordsValueWrappers.find(valueWrapper=>{return valueWrapper.value.listInfoETag!==listInfoValueWrapper.value.eTag;})){return cacheUtils.fetchAndStagePutListUi(parameters.recordService,parameters.listUiCacheKey);}const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(parameters.listUiCacheKey);// see how many records we found
    let recordsFound=listRecordsValueWrappers.reduce((sum,valueWrapper)=>sum+valueWrapper.value.records.length,0);if(listRecordsValueWrappers.length>0){recordsFound-=offset;}// if we found enough records or hit the end of the data then we're done
    if(recordsFound>=listUiCacheKeyBuilder.pageSize||listRecordsValueWrappers.length>0&&!listRecordsValueWrappers[listRecordsValueWrappers.length-1].value.nextPageToken){// type inference doesn't do what we want here - need to be explicit
    return [listInfoValueWrapper,listRecordsValueWrappers,listRecordsCacheKeys,offset];}// fetch the missing records
    let pageTokenToFetch;if(listRecordsValueWrappers.length>0){// we want to fetch the nextPageToken from the last chunk of records we got
    pageTokenToFetch=listRecordsValueWrappers[listRecordsValueWrappers.length-1].value.nextPageToken;}else{// if no records were found, use the caller-supplied pageToken
    pageTokenToFetch=listUiCacheKeyBuilder.pageToken;}// TODO - pageTokenToFetch is of type string|null|undefined whereas setPageToken() requires string|undefined
    const listRecordsCacheKey=new ListRecordsCacheKeyBuilder().setListUiCacheKey(parameters.listUiCacheKey).setPageToken(pageTokenToFetch).build();// fetch the remainder of the records from the server
    return cacheUtils.fetchAndStagePutListRecords(parameters.recordService,listRecordsCacheKey,listUiCacheKeyBuilder.pageSize-recordsFound).then(([fetchedListRecordsValueWrappers,fetchedListRecordsCacheKeys,fetchedOffset])=>{{// TODO - seems like there might be cases where this could be non-0 if we used the caller's pageToken above?
    assert$1(fetchedOffset===0,"unexpected offset returned from fetching records");}// If any of the list-records don't match the list-info then just reload everything.
    // In theory it might be possible to save/reuse some of the list-records, but this
    // should be rare & the logic would be complex.
    if(fetchedListRecordsValueWrappers.find(valueWrapper=>{return valueWrapper.value.listInfoETag!==listInfoValueWrapper.value.eTag;})){return cacheUtils.fetchAndStagePutListUi(parameters.recordService,parameters.listUiCacheKey);}// type inference doesn't do what we want here - need to be explicit
    return [listInfoValueWrapper,[...listRecordsValueWrappers,...fetchedListRecordsValueWrappers],[...listRecordsCacheKeys,...fetchedListRecordsCacheKeys],offset];});});}).then(([listInfoValueWrapper,listRecordsValueWrappers,listRecordsCacheKeys,offset])=>{// save the ValueWrappers and CacheKeys for the next step
    valueWrappers=[listInfoValueWrapper,...listRecordsValueWrappers];cacheKeys=[listInfoCacheKey,...listRecordsCacheKeys];// assemble the pieces back into a list-ui
    return cacheUtils.constructListUi(parameters.recordService,listInfoValueWrapper,listRecordsValueWrappers,offset,parameters.listUiCacheKey);}).then(listUi=>{cacheUtils.stagePutListArtifact(parameters.listUiCacheKey,listUi,valueWrappers,cacheKeys);return cacheAccessor.commitPuts();}).then(affectedKeys=>{// Notify affected keys of our commit
    return Thenable.all(parameters.ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});});}/**
     * Indicates if two list-ui ValueProviders are equivalent.
     *
     * @param otherValueProvider ValueProvider
     * @return true if the two ValueProviders are equivalent; false if not
     */function equals(otherValueProvider){// ValueProviders are equivalent if they have the same parameters
    const p1=this.parameters;const p2=otherValueProvider.parameters;// check if same number of keys & all keys equal
    return Object.keys(p1).length===Object.keys(p2).length&&Object.keys(p1).every(key=>p1[key]===p2[key]);}/**
     * Provider function for list-uis collections.
     *
     * @param cacheAccessor accessor to get to the LDS cache
     * @param parameters parameters indicating what value is to be returned;
     * @returns provide result
     */function provide$1(cacheAccessor,parameters){const cacheUtils=new ListUiCacheUtils(cacheAccessor,{chunkSize:parameters.chunkSize,ttl:parameters.ttl});return cacheAccessor.get(parameters.listCollectionCacheKey).then(listCollectionValueWrapper=>{// if we already have a value & it's not expired then we're done
    if(!cacheUtils.expired(listCollectionValueWrapper,parameters.ttl)){return ValueProviderResult.CACHE_HIT;}// cache value was missing or too old, see which pieces we do have
    let valueWrappers;let cacheKeys;return cacheUtils.collectCachedLists(parameters.listCollectionCacheKey).then(([listCollectionValueWrappers,listCollectionCacheKeys,offset])=>{// toss out all the list-collections at or past the first expired one
    const firstExpired=listCollectionValueWrappers.findIndex(valueWrapper=>cacheUtils.expired(valueWrapper));if(firstExpired>=0){listCollectionValueWrappers.splice(firstExpired);listCollectionCacheKeys.splice(firstExpired);}// from here on out, all ValueWrappers exist and have values or, stated more cleverly:
    // assert(listCollectionValueWrappers.every(vw => vw && vw.value))
    const listCollectionCacheKeyBuilder=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(parameters.listCollectionCacheKey,true);// see how many lists we found
    let listsFound=listCollectionValueWrappers.reduce((sum,valueWrapper)=>sum+valueWrapper.value.count,0);if(listCollectionValueWrappers.length>0){listsFound-=offset;}// if we found enough lists or hit the end of the data then we're done
    if(listCollectionCacheKeyBuilder.pageSize&&listsFound>=listCollectionCacheKeyBuilder.pageSize||listCollectionValueWrappers.length>0&&!listCollectionValueWrappers[listCollectionValueWrappers.length-1].value.nextPageToken){// type inference here doesn't match the type inference for the next then() therefore I need to be explicit
    return Promise.resolve([listCollectionValueWrappers,listCollectionCacheKeys,offset]);}// fetch the missing lists
    let pageTokenToFetch;if(listCollectionValueWrappers.length>0){// we want to fetch the nextPageToken from the last chunk of list views we got
    pageTokenToFetch=listCollectionValueWrappers[listCollectionValueWrappers.length-1].value.nextPageToken;}else{// if no list views were found, use the caller-supplied pageToken
    pageTokenToFetch=listCollectionCacheKeyBuilder.pageToken;}// TODO - pageTokenToFetch is of type string|null|undefined whereas setPageToken() requires string|undefined
    const listCollectionCacheKey=new ListCollectionCacheKeyBuilder().setListCollectionCacheKey(parameters.listCollectionCacheKey).setPageToken(pageTokenToFetch).build();const pageSize=listCollectionCacheKeyBuilder.pageSize?listCollectionCacheKeyBuilder.pageSize-listsFound:DEFAULT_LIST_COLLECTION_PAGE_SIZE;// fetch the remainder of the lists from the server
    return cacheUtils.fetchAndStagePutListCollection(listCollectionCacheKey,pageSize).then(([fetchedListCollectionValueWrappers,fetchedListCollectionCacheKeys,fetchedOffset])=>{// type inference here doesn't match the type inference for the next then() therefore I need to be explicit
    const result=[[...listCollectionValueWrappers,...fetchedListCollectionValueWrappers],[...listCollectionCacheKeys,...fetchedListCollectionCacheKeys],offset];return result;});}).then(([listCollectionValueWrappers,listCollectionCacheKeys,offset])=>{// save the ValueWrappers and CacheKeys for the next step
    valueWrappers=listCollectionValueWrappers;cacheKeys=listCollectionCacheKeys;// assemble the pieces back into a list-ui
    return cacheUtils.constructListCollection(listCollectionValueWrappers,offset,parameters.listCollectionCacheKey);}).then(listCollection=>{cacheUtils.stagePutListArtifact(parameters.listCollectionCacheKey,listCollection,valueWrappers,cacheKeys);return cacheAccessor.commitPuts();}).then(affectedKeys=>{// Notify affected keys of our commit
    return Thenable.all(parameters.ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});});}/**
     * Indicates if two list-ui ValueProviders are equivalent.
     *
     * @param otherValueProvider
     * @return true if the two ValueProviders are equivalent; false if not
     */function equals$1(otherValueProvider){// ValueProviders are equivalent if they have the same parameters
    const p1=this.parameters;const p2=otherValueProvider.parameters;// check if same number of keys & all keys equal
    return Object.keys(p1).length===Object.keys(p2).length&&Object.keys(p1).every(key=>p1[key]===p2[key]);}/*
     * Provides functionality to read list ui data from the cache. Can refresh the data from the server.
     */class ListUiService extends LdsServiceBase{/*
         * Constructor.
         *
         * @param ldsCache the LdsCache instance that backs this service
         */constructor(ldsCache){super(ldsCache,[LIST_UI_VALUE_TYPE,LIST_RECORDS_VALUE_TYPE,LIST_VIEWS_VALUE_TYPE,LIST_INFO_VALUE_TYPE]);/**
             *
             */this.listRecordsChunkSize=DEFAULT_LIST_RECORDS_CHUNK_SIZE;/**
             *
             */this.listCollectionChunkSize=DEFAULT_LIST_COLLECTION_CHUNK_SIZE;/**
             * TTL for cached list-ui data
             */this.listUiTTL=LIST_UI_TTL;// TODO: Once this service is split into multiple services, it should impliment the
    // getAffectedKeyHandler function and not call the registerAffectedKeyHandler function anymore
    // since this is done automatically when the service is registered.
    this._ldsCache.registerAffectedKeyHandler(LIST_UI_VALUE_TYPE,this._listUiAffectedKeyHandler.bind(this));this._ldsCache.registerAffectedKeyHandler(LIST_RECORDS_VALUE_TYPE,()=>ThenableFactory.resolve(undefined));this._ldsCache.registerAffectedKeyHandler(LIST_VIEWS_VALUE_TYPE,()=>ThenableFactory.resolve(undefined));}getCacheValueTtl(){return LIST_UI_TTL;}/**
         * Returns an observable for a list-ui constructed from the given inputs.
         *
         * @param objectApiName The API name of the List View's entity (must be specified along with listViewApiName)
         * @param listViewApiName List View API name (must be specified with objectApiName)
         * @param listViewId Id of the List View (may be specified without objectApiName or listViewApiName)
         * @param pageToken Page id of records to retrieve
         * @param pageSize Number of records to retrieve at once
         * @param sortBy A qualified field API name on which to sort
         * @param fields An array of qualified field API names of fields to include.
         * @param optionalFields An array of qualified field API names of optional fields to include.
         * @param q Query string to filter list views (only for list of lists)
         * @returns {Observable} See description.
         */getListUi(params){let cacheKey;let valueProvider;let fieldsAsStrings;let optionalFieldsAsStrings;let pageSize=params.pageSize;// convert importable schema to string
    const objectApiName=params.objectApiName&&getObjectApiName(params.objectApiName);const sortBy=params.sortBy&&getFieldApiName(params.sortBy);const listViewId=params.listViewId&&getObjectApiName(params.listViewId);if(params.fields){fieldsAsStrings=Array.isArray(params.fields)?params.fields.map(field=>getFieldApiName(field)):[];}if(params.optionalFields){optionalFieldsAsStrings=Array.isArray(params.optionalFields)?params.optionalFields.map(field=>getFieldApiName(field)):[];}// If we have a list id or an api and dev name then its a request for list-ui
    if(listViewId||objectApiName&&params.listViewApiName){if(pageSize==null){pageSize=DEFAULT_LIST_RECORDS_PAGE_SIZE;}cacheKey=new ListUiCacheKeyBuilder().setListReference(objectApiName,params.listViewApiName,listViewId).setPageToken(params.pageToken).setPageSize(pageSize).setSortBy(sortBy).setFields(fieldsAsStrings).setOptionalFields(optionalFieldsAsStrings).build();valueProvider=new ValueProvider(provide,{ldsCache:this._ldsCache,recordService:this._recordService,listUiCacheKey:cacheKey,ttl:LIST_UI_TTL,chunkSize:this.listRecordsChunkSize},equals);}else if(objectApiName){if(pageSize==null){pageSize=DEFAULT_LIST_COLLECTION_PAGE_SIZE;}cacheKey=new ListCollectionCacheKeyBuilder().setObjectApiName(objectApiName).setPageToken(params.pageToken).setPageSize(pageSize).setQ(params.q).build();valueProvider=new ValueProvider(provide$1,{ldsCache:this._ldsCache,listCollectionCacheKey:cacheKey,ttl:LIST_COLLECTION_TTL,chunkSize:this.listCollectionChunkSize},equals$1);}return cacheKey&&valueProvider&&pageSize>0?this._ldsCache.get(cacheKey,valueProvider):undefined;}/* Exposed function to consumers.
         * Allows to save a new sort order
         */async saveSort(objectApiName,listViewApiName,listViewId/* , newSortBy*/){// TODO: Doesn't save for now, only invalidates the right caches
    // TODO: We need to invalidate all caches that are without sortBy (in all variations)
    // newSortBy = newSortBy ? newSortBy : [];
    // newSortBy = Array.isArray(newSortBy) ? newSortBy : [newSortBy];
    const cacheKey=new ListUiCacheKeyBuilder().setListReference(getObjectApiName(objectApiName),listViewApiName,listViewId)// .setFields(fields)
    // .setOptionalFields(optionalFields)
    .build();this._ldsCache.evict(cacheKey);return Promise.resolve();}/* Exposed function to consumers.
         * Allows to save column widths
         */async saveColumnWidths(objectApiName,listViewApiName,listViewId/* , columnWidthMapping*/){// TODO: Doesn't save for now, only invalidates the right caches
    // TODO: We need to invalidate all caches of that list id (in all variations)
    const cacheKey=new ListUiCacheKeyBuilder().setListReference(getObjectApiName(objectApiName),listViewApiName,listViewId)// .setFields(fields)
    // .setOptionalFields(optionalFields)
    .build();this._ldsCache.evict(cacheKey);return Promise.resolve();}/**
         * TODO: When this service class gets refactored into multiple services and updated to typescript, this method needs to be implimented!
         * @param dependentCacheKeys List of dependent cache keys.
         * @param value The value to cache.
         * @param cacheAccessor An object to access cache directly.
         * @returns A thenable which resolves when the stage put is completed.
         */stagePutValue(dependentCacheKeys,value,cacheAccessor){// TODO: Implement this!
    throw getLdsInternalError("UNSUPPORTED_OPERATION","Lists service does not implement stagePutValue",true);}/**
         * TODO: When this service class gets refactored into multiple services and updated to typescript, this method needs to be implimented!
         * Strips all eTag properties from the given value by directly deleting them.
         * @returns The given value with its eTags stripped.
         * @param value The value from which to strip the eTags.
         */stripETagsFromValue(value){return value;}/**
         * Reference to the RecordService instance.
         */get _recordService(){return this._ldsCache.getService(RECORD_VALUE_TYPE);}/**
         * Whenever the list ui cache key is affected we need to denormalize what we have
         * in the cache and re-emit this to the consumer.
         *
         * For example: Since we chain together list-ui -> list-records -> records markers,
         * whenever a record changes from record home we will be notified of that change
         * and we need to denormalize our list-ui which will fetch the latest cached record
         * data using the saved record markers.
         *
         * @param affectedKey list-ui cache key that was affected
         * @param cacheAccessor - a cache accessor 2 object
         * @returns resolved once the new list-ui has been emitted or we
         *    have determined that there is insufficient cached data to emit.
         */_listUiAffectedKeyHandler(affectedKey,cacheAccessor){return cacheAccessor.get(affectedKey).then(listUiValueWrapper=>{const cacheUtils=new ListUiCacheUtils(cacheAccessor,{chunkSize:this.listRecordsChunkSize,ttl:this.listUiTTL});// list-ui missing, ignore key
    if(cacheUtils.expired(listUiValueWrapper,0)){return ThenableFactory.resolve(undefined);}const listInfoCacheKey=new ListInfoCacheKeyBuilder().setListUiCacheKey(affectedKey).build();return cacheAccessor.get(listInfoCacheKey).then(listInfoValueWrapper=>{// list-info missing, ignore key; note that the "0" parameter at the end suppresses the
    // ttl check so we're just checking for null/undefined
    if(cacheUtils.expired(listInfoValueWrapper,0)){return ThenableFactory.resolve(undefined);}return cacheUtils.collectCachedRecords(affectedKey).then(([listRecordsValueWrappers/* listRecordsCacheKeys */,,offset])=>{// toss out all the list-records at or past the first missing one (we can still use
    // expired values for this scenario)
    const firstMissing=listRecordsValueWrappers.findIndex(valueWrapper=>cacheUtils.expired(valueWrapper,0));if(firstMissing>=0){listRecordsValueWrappers.splice(firstMissing);}// from here on out, all ValueWrappers exist and have values or, stated more cleverly:
    // if ("development" !== 'production') {
    //     assert(listRecordsValueWrappers.every(lrvw => lrvw && lrvw.value))
    // }
    const listUiCacheKeyBuilder=new ListUiCacheKeyBuilder().setListUiCacheKey(affectedKey);// we must either have all the records or have hit the end of the list to continue
    const recordsFound=listRecordsValueWrappers.reduce((sum,valueWrapper)=>sum+valueWrapper.value.records.length,0)-offset;if(recordsFound<listUiCacheKeyBuilder.pageSize&&listRecordsValueWrappers.length>0&&listRecordsValueWrappers[listRecordsValueWrappers.length-1].value.nextPageToken);// make sure we're not mixing data from different versions of the
    const mismatchedEtags=listRecordsValueWrappers.find(valueWrapper=>{const recordEtag=valueWrapper.value.listInfoETag;const metadataEtag=listInfoValueWrapper.value.eTag;return recordEtag!==metadataEtag;});if(mismatchedEtags){// TODO - fork this off for background processing - we need to refetch the data
    throw new Error("found mismatched etags for list");}// assemble the pieces back into a list-ui
    return cacheUtils.constructListUi(this._recordService,listInfoValueWrapper,listRecordsValueWrappers,offset,affectedKey);}).then(listUi=>{const listUiValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(listUiValueWrapper,listUi);cacheAccessor.stageEmit(affectedKey,listUiValueWrapperToEmit);});});});}}/*
     * Generates the wire adapter for List Ui
     */class ListUiWireAdapterGenerator{/*
         * Constructor.
         * @param listUiService Reference to the ListUiService instance.
         */constructor(listUiService){this._listUiService=listUiService;}/*
         * Generates the wire adapter for getObjectInfo.
         * @returns WireAdapter - See description.
         */generateGetListUiWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetListUi.bind(this));return wireAdapter;}/*
         * Service getListUi @wire.
         * @private
         * @param config: Config params for the service.
         * @return Observable stream that emits a list ui.
         */_serviceGetListUi(config){if(!config.listViewId&&!config.objectApiName){return undefined;}return this._listUiService.getListUi(config);}}/*
     * Wire adapter id: getListUi.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     * @returns void
     */function getListUi(){throw generateError("getListUi");}/**
     * Lookup actions value type
     */const LOOKUP_ACTIONS_VALUE_TYPE="lds.LookupActions";/**
     * Lookup actions value expires in 5 minutes in cache
     */const LOOKUP_ACTIONS_TTL=5*60*1000;/**
     * Returns a comma delimited string insensitive to letter cases and order of the input strings
     * @param array An array of strings
     * @return see description
     */function stableCommaDelimitedString(array){return array&&array.length?[...array].sort().join(","):"";}class LookupActionsCacheKeyBuilder extends CacheKeyBuilder{/**
         * Default constructor
         */constructor(){super(LOOKUP_ACTIONS_VALUE_TYPE);}/**
         * Sets the list of object api names
         * @param objectApiNames The list of object api names
         * @return This builder
         */setObjectApiNames(objectApiNames){this._objectApiNames=objectApiNames;return this;}/**
         * Sets the form factor
         * @param formFactor The form factor
         * @return This builder
         */setFormFactor(formFactor){this._formFactor=formFactor;return this;}/**
         * Sets the sections
         * @param sections The sections
         * @return This builder
         */setSections(sections){this._sections=sections;return this;}/**
         * Sets the action types
         * @param actionTypes The action types
         * @return This builder
         */setActionTypes(actionTypes){this._actionTypes=actionTypes;return this;}/**
         * Builds a cache key for lookup actions
         * @return See description
         */build(){{assert$1(this._objectApiNames.length,"A non-empty objectApiNames must be provided.");}const objectApiNames=stableCommaDelimitedString(this._objectApiNames);const formFactor=this._formFactor||"";const sections=stableCommaDelimitedString(this._sections);const actionTypes=stableCommaDelimitedString(this._actionTypes);return new CacheKey(this.getValueType(),[objectApiNames,formFactor,sections,actionTypes].join(KEY_DELIM));}}/**
     * Quick and dirty function to reconstruct lookup actions parameters from a cache key
     * TODO revisit this approach in 218
     * @param affectedKey A cache key
     * @return Lookup actions parameters
     */function reverseEngineer(affectedKey){const reverseJoin=str=>str?str.split(","):[];const[,objectApiNames,formFactor,sections,actionTypes]=affectedKey.getKey().split(KEY_DELIM);return {objectApiNames:reverseJoin(objectApiNames),formFactor,sections:reverseJoin(sections),actionTypes:reverseJoin(actionTypes)};}/**
     * Builds a lookup actions cache key
     *
     * @param parameters Parameters for a lookup actions request
     * @return A cache key for a lookup actions payload
     */function buildCacheKey(parameters){const{objectApiNames,formFactor,actionTypes,sections}=parameters;return new LookupActionsCacheKeyBuilder().setObjectApiNames(objectApiNames).setFormFactor(formFactor).setActionTypes(actionTypes).setSections(sections).build();}/**
     * Value type for action definition
     */const ACTION_DEFINITION_VALUE_TYPE="lds.ActionDefinition";/**
     * Builder builds a cache key from the externalId of an action
     * @extends CacheKeyBuilder
     */class ActionDefinitionCacheKeyBuilder extends CacheKeyBuilder{/**
         * Default Constructor
         */constructor(){super(ACTION_DEFINITION_VALUE_TYPE);}/**
         * Sets the external id
         * @param externalId The external id
         * @return This builder
         */setExternalId(externalId){this._externalId=externalId;return this;}/**
         * @return A cache key for action definition
         */build(){return new CacheKey(this.getValueType(),this._externalId.split(":").slice(5).join(":"));}}/**
     * Builder builds a cache key from a marker
     */class ActionDefinitionCacheKeyBuilderFromMarker extends CacheKeyBuilder{/**
         * Default Constructor
         */constructor(){super(ACTION_DEFINITION_VALUE_TYPE);}/**
         * Sets the marker
         * @param marker The marker of an action definition
         * @return This builder
         */setMarker(marker){this._marker=marker;return this;}/**
         * @return A cache key for an action definition
         */build(){return new CacheKey(this.getValueType(),this._marker.key.split(":").slice(1).join(":"));}}/**
     * Function builds a marker from a cache key
     * @param actionDefinitionCacheKey
     * @return A marker of an action definition
     */function buildActionDefinitionMarker(actionDefinitionCacheKey){return {key:actionDefinitionCacheKey.getKey()};}/**
     * Normalize an action payload. The call doesn't mutate the input payload.
     * @param cacheAccessor The cache accessor
     * @param fnForCacheKeyDependenciesOfKey A function provided by endpoint to specify the cache key and its non-action-hierarchical dependencies given a key
     * @param cacheKey The cache key of the payload, usually available from within the caller (the endpoint) before this call
     * @param payload The de-normalized action payload returned from Ui Api
     */function normalizePayload(cacheAccessor,fnForCacheKeyDependenciesOfKey,cacheKey,payload){// a function to normalize one key value pair of an action payload
    const normalizeAndStageSingleKeyedPayload=(key,multipleKeyedPayloadCacheKeys,valueWrapperProperties)=>{// for a provided key,
    // cache key is the cache key of the single keyed payload,
    // dependencies are non-action-hierarchical ones each end point has the best knowledge what they are
    const{cacheKey:singleKeyedPayloadCacheKey,dependencies:interModuleDependencies}=fnForCacheKeyDependenciesOfKey(key);// a function to extract action definition from the action payload and replace it with a marker
    const extractActionDefinition=platformActionRepresentation=>{// a set of hard coded fields extracted as the action definition
    const{actionTarget,actionTargetType,apiName,iconUrl,label,primaryColor,subtype,type}=platformActionRepresentation,rest=_objectWithoutProperties(platformActionRepresentation,["actionTarget","actionTargetType","apiName","iconUrl","label","primaryColor","subtype","type"]);const actionDefinition={actionTarget,actionTargetType,apiName,iconUrl,label,primaryColor,subtype,type};const actionDefinitionCacheKey=new ActionDefinitionCacheKeyBuilder().setExternalId(rest.externalId).build();// stage action definition payload and their dependencies
    cacheAccessor.stagePut([singleKeyedPayloadCacheKey,...multipleKeyedPayloadCacheKeys],actionDefinitionCacheKey,actionDefinition,actionDefinition);const marker=buildActionDefinitionMarker(actionDefinitionCacheKey);return _objectSpread({},rest,{actionDefinition:marker});};// prepare single key payload by extracting action definition, value could be either a single action or a list of actions
    const value=payload.actions[key];const singleKeyedPayload={actions:{}};singleKeyedPayload.actions[key]={actions:value.actions.map(extractActionDefinition)};// prepare de-normalized payload to emit, making sure it has the necessary action payload envelop so that no payload transformation on a cache hit
    const valueToEmit={actions:{}};valueToEmit.actions[key]={actions:value.actions};// stage single keyed payload
    cacheAccessor.stagePut(multipleKeyedPayloadCacheKeys,singleKeyedPayloadCacheKey,singleKeyedPayload,valueToEmit,valueWrapperProperties);// when non-action-hierarchical dependencies are provided by endpoint, stage them up
    if(interModuleDependencies){interModuleDependencies.forEach(dependency=>{cacheAccessor.stageDependencies([singleKeyedPayloadCacheKey],dependency);});}return [singleKeyedPayloadCacheKey,valueToEmit];};const keys=Object.keys(payload.actions);if(keys.length===0){// no normalization at all
    cacheAccessor.stagePut([],cacheKey,payload,{actions:payload.actions});}else if(keys.length===1){// normalize the only key, there is no multiple keyed payload cache keys specified
    normalizeAndStageSingleKeyedPayload(keys[0],[],{eTag:payload.eTag});}else{const{normalized,denormalized}=keys.reduce((result,key)=>{// the following call fully stages up single keyed payload and their dependencies
    const[singleKeyedPayloadCacheKey,singleKeyedPayloadToEmit]=normalizeAndStageSingleKeyedPayload(key,[cacheKey]);// replaces single keyed payload with a marker
    result.normalized.actions[key]={key:singleKeyedPayloadCacheKey.getKey()};result.denormalized.actions[key]=singleKeyedPayloadToEmit.actions[key];return result;},{normalized:{actions:{}},denormalized:{actions:{}}});// stages up multiple keyed payload
    cacheAccessor.stagePut([],cacheKey,normalized,denormalized,{eTag:payload.eTag});}}/**
     * A utility function to get cache value from the cache accessor.
     * The use of this function is private to de-normalization process since lds-cache currently never evicts
     * thus the function assumes the value always exists in the cache during de-normalization.
     *
     * @param cacheAccessor The cache accessor
     * @param cacheKey The cache key
     * @return The value of the value wrapper if exists
     */function getValue(cacheAccessor,cacheKey){return cacheAccessor.get(cacheKey).then(valueWrapper=>{if(valueWrapper&&valueWrapper.value){return valueWrapper.value;}throw new Error(`Value not found for cache key: ${cacheKey.getKey()}`);});}/**
     * De-normalize an action payload. The call doesn't mutate the normalized payload in the cache. It doesn't emit payload with eTag.
     *
     * @param cacheAccessor The cache accessor
     * @param affectedKey The affected cache key of the payload to be de-normalized
     * @param fnForCacheKeyDependenciesOfKey A function provided by end point to specify the cache key given a key
     * @return A de-normalized action payload
     */function denormalizePayload(cacheAccessor,affectedKey,fnForCacheKeyDependenciesOfKey){// a function to replace a marker with an action definition retrieved from the cache
    const restoreActionDefinition=normalizedAction=>{const{actionDefinition:actionDefinitionMarker}=normalizedAction,rest=_objectWithoutProperties(normalizedAction,["actionDefinition"]);// reconstruct the cache key by the marker
    const cacheKey=new ActionDefinitionCacheKeyBuilderFromMarker().setMarker(actionDefinitionMarker).build();return getValue(cacheAccessor,cacheKey).then(value=>Object.assign({},value,rest));};// a function to de-normalize single keyed payload, the value could either be a single action or a list of actions
    const denormalizeSingleKeyedPayload=payload=>{return Thenable.all(payload.actions.map(restoreActionDefinition)).then(actions=>({actions}));};return getValue(cacheAccessor,affectedKey).then(value=>{const normalizedPayload=value;const keys=Object.keys(normalizedPayload.actions);if(keys.length===0){return Thenable.resolve({actions:{}});}else if(keys.length===1){// de-normalize the only key/value pair
    const key=keys[0];return denormalizeSingleKeyedPayload(normalizedPayload.actions[key]).then(actions=>{const singleKeyedPayload={actions:{}};singleKeyedPayload.actions[key]=actions;return singleKeyedPayload;});}else{// de-normalize each key, replace each normalized value with de-normalized payload
    const multipleKeyedPayload={actions:_objectSpread({},normalizedPayload.actions)};return Thenable.all(Object.keys(multipleKeyedPayload.actions).map(key=>{const{cacheKey}=fnForCacheKeyDependenciesOfKey(key);return getValue(cacheAccessor,cacheKey).then(normalizedSingleKeyedPayload=>{// de-normalize single keyed payload
    return denormalizeSingleKeyedPayload(normalizedSingleKeyedPayload.actions[key]);}).then(singleOrMultipleRawActions=>{multipleKeyedPayload.actions[key]=singleOrMultipleRawActions;});})).then(()=>multipleKeyedPayload);}});}// eslint-disable-next-line lwc/no-compat-execute
    /**
     * The ui api end point of lookup actions
     */const ACTIONS_GLOBAL_CONTROLLER="ActionsController.getLookupActions";/**
     * Service to retrieve lookup actions via UI API
     */class LookupActionsService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param affectedKeyHandlerInspector Used by tests to inspect the affectedKeyHandler.
         * @param valueProviderFunctionInspector Used by tests to inspect the valueProviderFunction.
         */constructor(ldsCache,functionProvidesValueProviderFunction){super(ldsCache,[LOOKUP_ACTIONS_VALUE_TYPE]);/**
             * Implementation of affected key handler for this service
             */this.affectedKeyHandler=(affectedKey,cacheAccessor)=>{const parameters=reverseEngineer(affectedKey);return cacheAccessor.get(affectedKey).then(oldValueWrapper=>{if(oldValueWrapper){return denormalizePayload(cacheAccessor,affectedKey,this.getCacheKeyDependencyOfKey.bind(this,parameters)).then(updatedActionPayloadToEmit=>{const valueWrapper=ValueWrapper.cloneWithValueOverride(oldValueWrapper,updatedActionPayloadToEmit);cacheAccessor.stageEmit(affectedKey,valueWrapper);});}return Thenable.resolve();});};this._functionProvidesValueProviderFunction=functionProvidesValueProviderFunction;}getCacheValueTtl(){return LOOKUP_ACTIONS_TTL;}/**
         * @return A higher order of function that returns an affected key handler
         */getAffectedKeyHandler(){return this.affectedKeyHandler;}/**
         * Retrieves lookup actions
         *
         * @param objectApiNameArray Object API names of lookup actions to retrieve.
         * @param requestParams Options to filter the resulting actions by formFactor, sections, or actionTypes
         * @returns A collections of actions categorized by their associated object api name
         *
         */getLookupActions(objectApiNameArray,requestParams){const objectApiNames=objectApiNameArray.map(getObjectApiName);const parameters=Object.assign({},{objectApiNames},requestParams);const cacheKey=buildCacheKey(parameters);const valueProviderFunction=this._functionProvidesValueProviderFunction?this._functionProvidesValueProviderFunction(cacheKey,parameters,false):this.getValueProviderFn(cacheKey,parameters,false);return this._ldsCache.get(cacheKey,new ValueProvider(valueProviderFunction,{}));}/**
         * Stage puts the given action.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param action The action to stagePut.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData Data to build cache key with
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,action,cacheAccessor,additionalData){const recordActionCacheKey=buildCacheKey(additionalData);cacheAccessor.stagePut(dependentCacheKeys,recordActionCacheKey,action,action);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given action by directly deleting them.
         * @param action The action from which to strip the eTags.
         * @returns The given action with its eTags stripped.
         */stripETagsFromValue(action){delete action.eTag;return action;}/**
         * A higher order function to provide a value provider function
         * @param cacheKey The cache key
         * @param params The lookup action parameters for the transaction
         * @param forceFetch Indicates whether a server round trip is forced
         * @return A value provider function
         */getValueProviderFn(cacheKey,params,forceFetch){return cacheAccessor=>{return cacheAccessor.get(cacheKey).then(cacheEntry=>{if(!forceFetch&&this.doesCacheEntryHasValue(cacheEntry)&&this.hasNotExpired(cacheAccessor.nowTime,cacheEntry)){return Thenable.resolve(ValueProviderResult.CACHE_HIT);}return this.primeCacheEntries(params,cacheAccessor,cacheKey).then(result=>{if(cacheEntry&&cacheEntry.eTag&&result.eTag&&cacheEntry.eTag===result.eTag){return ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED;}else{return ValueProviderResult.CACHE_MISS;}});});};}/**
         * Makes a server round trip and normalizes the response
         * @param parameters The lookup action parameters for the round trip
         * @param cacheAccessor The cache accessor for the transaction
         * @param cacheKey The cache key for the payload
         * @return The action representation
         */primeCacheEntries(parameters,cacheAccessor,cacheKey){return executeAuraGlobalController(ACTIONS_GLOBAL_CONTROLLER,parameters).then(response=>{return response.body;}).then(result=>{normalizePayload(cacheAccessor,this.getCacheKeyDependencyOfKey.bind(this,parameters),cacheKey,result);return cacheAccessor.commitPuts().then(affectedKeys=>Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor))).then(()=>result);});}/**
         * Calculates the cache key and dependencies provided the parameters for the request
         * @param formFactor The form factor
         * @param sections The sections
         * @param actionTypes The action types
         * @param objectApiName The object api name
         * @return The cache key of the request along with their dependencies
         */getCacheKeyDependencyOfKey({formFactor,sections,actionTypes},objectApiName){const cacheKey=new LookupActionsCacheKeyBuilder().setObjectApiNames([objectApiName]).setFormFactor(formFactor).setSections(sections).setActionTypes(actionTypes).build();return {cacheKey,dependencies:[]};}/**
         * A function to check whether cache entry has expired
         * @param now Current timestamp
         * @param entry Cache entry
         * @returns Whether cache entry has expired
         */hasNotExpired(now,entry){return !isNaN(now)&&!isNaN(entry.lastFetchTime)&&now-entry.lastFetchTime<LOOKUP_ACTIONS_TTL;}/**
         * A function to check whether cache entry has a value
         * @param entry Cache entry
         * @return Whether the cache entry has a value
         */doesCacheEntryHasValue(entry){return entry?entry.value!==undefined:false;}}/**
     * Wire adapter id: getLookupActions.
     * @throws Always throws when invoked. Imperative invocation is not supported.
     */function getLookupActions(){throw generateError("getLookupActions");}/**
     * Generates the wire adapter for Lookup Actions.
     */class LookupActionsWireAdapterGenerator{/**
         * Constructor.
         * @param lookupActionsService Reference to the LookupActionsService instance.
         */constructor(lookupActionsService){this._lookupActionsService=lookupActionsService;}/**
         * Generates the wire adapter for getLookupActions.
         * @returns See description.
         */generateGetLookupActionsWireAdapter(){return generateWireAdapter(this.serviceGetLookupActions.bind(this));}/**
         * Service getLookupActions @wire.
         * @param config Config params for the service.
         * @return Observable stream that emits lookup actions.
         */serviceGetLookupActions(config){return this._lookupActionsService.getLookupActions(config.objectApiNames,config.requestParams);}}const LOOKUP_RECORDS_VALUE_TYPE="lds.LookupRecords";/**
     * Time to live for the LookupRecords cache value is 2 minutes.
     */const LOOKUP_RECORDS_TTL=2*60*1000;/**
     * Computes a key for lookup records caching.
     * @param fieldApiName - The qualified field api name.
     * @param targetApiName - The target entity api name.
     * @param requestParams - The request params to filter data.
     * @returns - A key for caching.
     */function computeKey(fieldApiName="",targetApiName="",requestParams={}){const requestParamKeys=Object.keys(requestParams).sort();const paramKeys=[];requestParamKeys.forEach(key=>{paramKeys.push(key);paramKeys.push(String(requestParams[key]));});// TODO - W-5590585 - Make lookups UI API and wire adapter case insensitive.
    // Currently, lookups UI API supports case insensitive targetApiName hence lowercase it while building key.
    return `${fieldApiName}${KEY_DELIM}${targetApiName.toLowerCase()}${KEY_DELIM}${paramKeys.join(KEY_DELIM)}`;}class LookupRecordsCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(LOOKUP_RECORDS_VALUE_TYPE);}/**
         * Sets the fieldApiName for the cache key.
         * @param fieldApiName - The fieldApiName used to build the cache key.
         * @returns - This builder. Useful for chaining method calls.
         */setFieldApiName(fieldApiName){this._fieldApiName=fieldApiName;return this;}/**
         * Sets the targetApiName for the cache key.
         * @param targetApiName - The targetApiName used to build the cache key.
         * @returns - This builder. Useful for chaining method calls.
         */setTargetApiName(targetApiName){this._targetApiName=targetApiName;return this;}/**
         * Sets the requestParams for the cache key.
         * @param requestParams - The requestParams used to build the cache key.
         * @returns - This builder. Useful for chaining method calls.
         */setRequestParams(requestParams){this._requestParams=requestParams;return this;}/**
         * Builds a cache key.
         */build(){{assert$1(this._fieldApiName,"A non-empty fieldApiName must be provided.");assert$1(this._targetApiName,"A non-empty targetApiName must be provided.");assert$1(this._requestParams,"A non-empty requestParams must be provided.");}return new CacheKey(this.getValueType(),computeKey(this._fieldApiName,this._targetApiName,this._requestParams));}}/**
     * Provides functionality to fetch lookup results for records.
     */class LookupRecordsService extends LdsServiceBase{constructor(ldsCache){super(ldsCache,[LOOKUP_RECORDS_VALUE_TYPE]);}getCacheValueTtl(){return LOOKUP_RECORDS_TTL;}/**
         * Gets lookup records.
         * @param fieldApiName - The qualified field API name.
         * @param targetApiName - The target object API name.
         * @param requestParams - Request params to filter data.
         * @returns - The observable used to get the value and keep watch on it for changes.
         */getLookupRecords(fieldApiName,targetApiName,requestParams={}){fieldApiName=getFieldApiName(fieldApiName);targetApiName=getObjectApiName(targetApiName);const cacheKey=new LookupRecordsCacheKeyBuilder().setFieldApiName(fieldApiName).setTargetApiName(targetApiName).setRequestParams(requestParams).build();const valueProviderParameters={cacheKey,fieldApiName,targetApiName,requestParams};const valueProvider=this._getValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Creates a ValueProvider for the LookupRecords.
         * @param valueProviderParams - Parameters to create ValueProvider for LookupRecords.
         * @returns - A value Provider instance.
         */_getValueProvider(valueProviderParams){const valueProvider=new ValueProvider((cacheAccessor,valueProviderParameters)=>{const{cacheKey,fieldApiName,targetApiName,requestParams,localFreshLookupRecords,forceProvide}=valueProviderParameters;if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,fieldApiName,targetApiName,requestParams,localFreshLookupRecords);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+LOOKUP_RECORDS_TTL;if(needsRefresh){// The value is stale, get a fresh one.
    return this._getFreshValue(cacheAccessor,cacheKey,fieldApiName,targetApiName,requestParams,localFreshLookupRecords,existingValueWrapper.eTag);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value, get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,fieldApiName,targetApiName,requestParams,localFreshLookupRecords);});},valueProviderParams);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor - An object to transactionally access the cache.
         * @param cacheKey - The cache key for the object info.
         * @param fieldApiName - The qualified field api name.
         * @param targetApiName - The target entity api name.
         * @param requestParams - Request params to filter data.
         * @param localFreshLookupRecords - Lookup records value you want explicitly put into cache instead of getting the value from the server.
         * @param eTagToCheck - eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns - A thenable of ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,fieldApiName,targetApiName,requestParams,localFreshLookupRecords,eTagToCheck){let transportResponseThenable;const params={fieldApiName,targetApiName,requestParams};// If the lookup records are provided, we don't go to the server to fetch it.
    if(localFreshLookupRecords){transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse(localFreshLookupRecords));}else{if(eTagToCheck){params.clientOptions={eTagToCheck};}// TODO - W-5528819 @wire(getLookupRecords) and LookupController.getLookupRecords params are inconsistent.
    const[objectApiName,unqualifiedFieldApiName]=splitQualifiedFieldApiName(fieldApiName);const auraControllerParams=_objectSpread({objectApiName,fieldApiName:unqualifiedFieldApiName,targetApiName},requestParams);transportResponseThenable=executeAuraGlobalController("LookupController.getLookupRecords",auraControllerParams);}return transportResponseThenable.then(transportResponse=>{// Cache miss refresh unchanged.
    if(transportResponse.status===304){return ThenableFactory.resolve(ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED);}return ThenableFactory.resolve(undefined).then(()=>{const freshValue=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);return this.stagePutValue([],freshValue,cacheAccessor,params);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{{// tslint:disable-next-line:no-console
    console.log(rejectionReason);}throw rejectionReason;});}/**
         * Stage puts the given lookup records.
         * @param dependentCacheKeys - A list of dependent cache keys.
         * @param lookupRecords - The lookup records value to cache.
         * @param cacheAccessor - An object to access cache directly.
         * @returns - A thenable on completing the stagePut operation.
         */stagePutValue(dependentCacheKeys,lookupRecords,cacheAccessor,params){const cacheKey=new LookupRecordsCacheKeyBuilder().setFieldApiName(params.fieldApiName).setTargetApiName(params.targetApiName).setRequestParams(params.requestParams).build();return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{const eTag=lookupRecords.eTag;if(existingValueWrapper&&existingValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(cacheKey);}// Strip out the eTag from the value.
    lookupRecords=this.stripETagsFromValue(lookupRecords);return cacheAccessor.stagePut(dependentCacheKeys,cacheKey,lookupRecords,lookupRecords,{eTag});});}/**
         * Strips eTag from the given LookupRecords.
         * @param LookupRecords - The LookupRecords from which to strip the eTag.
         * @returns - LookupRecords without eTag.
         */stripETagsFromValue(lookupRecords){delete lookupRecords.eTag;return lookupRecords;}}/**
     * Generates the wire adapter for Lookup Records.
     */class LookupRecordsWireAdapterGenerator{/**
         * Constructor.
         * @param lookupRecordsService - Reference to the LookupRecordsService instance.
         */constructor(lookupRecordsService){this._lookupRecordsService=lookupRecordsService;}/**
         * Generates the wire adapter for @wire getLookupRecords.
         */generateGetLookupRecordsWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetLookupRecords.bind(this));return wireAdapter;}/**
         * Service @wire getLookupRecords.
         * @private Made public for testing.
         * @param config - Config params for the service.
         * @returns - An observable stream that emits lookup records.
         */serviceGetLookupRecords(config){if(!config||!config.fieldApiName||!config.targetApiName){return undefined;}return this._lookupRecordsService.getLookupRecords(config.fieldApiName,config.targetApiName,config.requestParams);}}/**
     * Return the wire adapter id.
     */function getLookupRecords(){throw generateError("getLookupRecords");}/**
     * The valueType to use when building PicklistCacheKeyBuilder.
     */const PICKLIST_VALUES_VALUE_TYPE="uiapi.PicklistValuesRepresentation";/**
     * Time to live for the Picklist cache value. 5 minutes.
     */const PICKLIST_VALUES_TTL=5*60*1000;/**
     * Constructs a cache key for the Picklist value type. Keys are constructed from:
     * - objectApiName
     * - recordTypeId
     * - fieldApiName
     *
     * Picklist cache key is used as cache key for picklist field data provided by UI API.
     */class PicklistValuesCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(PICKLIST_VALUES_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The objectApiName used to build the picklist cache key.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName.toLowerCase();return this;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The recordTypeId used to build the picklist cache key.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this.recordTypeId=recordTypeId;return this;}/**
         * Sets the fieldApiName for the cache key.
         * @param fieldApiName The fieldApiName used to build the picklist cache key.
         * @returns The current object. Useful for chaining method calls.
         */setFieldApiName(fieldApiName){this.fieldApiName=fieldApiName;return this;}/**
         * Builds the cache key for the single picklist field api
         * @returns A new cache key representing the Picklist value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");assert$1(this.recordTypeId,"A non-empty recordTypeId must be provided.");assert$1(this.fieldApiName,"A non-empty fieldApiName must be provided.");assert$1(this.recordTypeId.length===18,"Record Type Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this.objectApiName}${KEY_DELIM}${this.recordTypeId}${KEY_DELIM}${this.fieldApiName}`);}}/**
     * Provides functionality to read picklist data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for the PicklistsByRecordType value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class PicklistValuesService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[PICKLIST_VALUES_VALUE_TYPE]);}getCacheValueTtl(){return PICKLIST_VALUES_TTL;}/**
         * Gets picklist values for a picklist field.
         * @param fieldApiName The picklist field's qualified API name.
         * @param recordTypeId The record type id. Pass '012000000000000AAA' for the master record type.
         * @returns An observable for the picklist values.
         */getPicklistValues(fieldApiName,recordTypeId){fieldApiName=getFieldApiName(fieldApiName);const[objectApiName,unqualifiedFieldApiName]=splitQualifiedFieldApiName(fieldApiName);recordTypeId=to18(recordTypeId);const cacheKey=new PicklistValuesCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).setFieldApiName(unqualifiedFieldApiName).build();const vpArgs={cacheKey,objectApiName,recordTypeId,fieldApiName:unqualifiedFieldApiName,forceProvide:false};const observable=this._ldsCache.get(cacheKey,this._createPicklistValueProvider(vpArgs));return observable;}/**
         * Stage puts the given picklist values object.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param picklistValues The picklist to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,picklistValues,cacheAccessor,additionalData){const picklistCacheKey=new PicklistValuesCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).setFieldApiName(additionalData.fieldApiName).build();const eTag=picklistValues.eTag;return cacheAccessor.get(picklistCacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(picklistCacheKey);}// Strip out the eTag from the value. We don't want to emit eTags!
    picklistValues=this.stripETagsFromValue(picklistValues);return cacheAccessor.stagePut(dependentCacheKeys,picklistCacheKey,picklistValues,picklistValues,{eTag});});}/**
         * Strips all eTag properties from the given picklist by directly deleting them.
         * @param picklistValues The picklist from which to strip the eTags.
         * @returns The given picklist with its eTags stripped.
         */stripETagsFromValue(picklistValues){delete picklistValues.eTag;return picklistValues;}/**
         * Constructs a value provider to retrieve picklist values.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve picklist values.
         */_createPicklistValueProvider(valueProviderParameters){const{// Do NOT set defaults here. See W-4840393.
    cacheKey,objectApiName,recordTypeId,fieldApiName,forceProvide}=valueProviderParameters;const picklistValueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,fieldApiName);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+PICKLIST_VALUES_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,fieldApiName,existingValueWrapper.eTag);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,fieldApiName);});},valueProviderParameters);return picklistValueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the picklistValues.
         * @param objectApiName The objectApiName of the picklistValues.
         * @param recordTypeId The recordTypeId of the picklistValues.
         * @param fieldApiName The fieldApiName of the picklistValues.
         * @param eTagToCheck eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns Returns a ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId,fieldApiName,eTagToCheck){let picklistValuesThenable;const params={objectApiName,recordTypeId,fieldApiName};if(eTagToCheck){params.clientOptions={eTagToCheck};}if(transportUtils.useAggregateUi){picklistValuesThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getPicklistValues",params,PICKLIST_VALUES_TTL);}else{picklistValuesThenable=executeAuraGlobalController("RecordUiController.getPicklistValues",params);}return picklistValuesThenable.then(transportResponse=>{// Cache miss refresh unchanged.
    if(transportResponse.status===304){return ThenableFactory.resolve(ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED);}// Cache miss.
    return ThenableFactory.resolve(undefined).then(()=>{const freshPicklist=transportResponse.body;// nothing to normalize
    {assert$1(freshPicklist.eTag!==undefined,`eTag was undefined for: ${cacheKey}`);}this.stagePutValue([],freshPicklist,cacheAccessor,{objectApiName,recordTypeId,fieldApiName});}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;});}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Represents an object that is used as a picklist normalization marker.
     */class PicklistValuesCacheValueMarker extends CacheValueMarker{constructor(timestamp,eTag){super(timestamp);this.eTag=eTag;}}/**
     * Constructs a PicklistCacheValueMarker.
     */class PicklistValuesCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Set the eTag for the picklist cache value marker builder.
         * @param eTag
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Builds the picklist value cache value marker.
         * @returns A new picklist cache value marker.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._eTag,"A non-empty eTag must be set.");}return new PicklistValuesCacheValueMarker(this._timestamp,this._eTag);}}/**
     * Wire adapter id: getPicklistValues.
     * @throws Always throws an error when invoked. Imperative invocation is not supported.
     */function getPicklistValues(){throw generateError("getPicklistValues");}/**
     * Generates the wire adapters for:
     * @wire getPicklistValues
     * @wire getPicklistValuesByRecordType
     */class PicklistValuesWireAdapterGenerator{/**
         * Constructor.
         * @param picklistValuesService Reference to the PicklistValuesService instance.
         */constructor(picklistValuesService){this._picklistValuesService=picklistValuesService;}/**
         * Generates the wire adapter for getPicklistValues.
         * @returns Returns the generated wire adapter for getPicklistValues
         */generateGetPicklistValuesWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetPicklistValues.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Services getPicklistValues @wire.
         * @param config Config params for the service.
         * @return Observable stream that emits a picklist values object.
         */serviceGetPicklistValues(config){if(!config){return undefined;}{const required=["fieldApiName","recordTypeId"];const supported=["fieldApiName","recordTypeId"];validateConfig("getPicklistValues",config,required,supported);}if(!config.recordTypeId||!config.fieldApiName){return undefined;}return this._picklistValuesService.getPicklistValues(config.fieldApiName,config.recordTypeId);}}/**
     * The valueType to use when building PicklistRecordTypeCacheKeyBuilder.
     */const PICKLIST_VALUES_BY_RT_VALUE_TYPE="uiapi.PicklistValuesCollectionRepresentation";/**
     * Time to live for the Picklist cache value. 5 minutes.
     */const PICKLIST_VALUES_BY_RECORD_TYPE_TTL=5*60*1000;/**
     * Constructs a cache key for the Picklist record type value type. Keys are constructed from:
     * - objectApiName
     * - recordTypeId
     *
     * Picklist record type cache key is used as cache key for picklist record type data provided by UI API.
     */class PicklistValuesByRecordTypeCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(PICKLIST_VALUES_BY_RT_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The objectApiName used to build the picklist cache key.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName.toLowerCase();return this;}/**
         * @returns The objectApiName used to build the picklist record type cache key.
         */getObjectApiName(){return this.objectApiName;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The recordTypeId used to build the picklist cache key.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this.recordTypeId=recordTypeId;return this;}/**
         * @returns The recordTypeId used to build the picklist record type cache key.
         */getRecordTypeId(){return this.recordTypeId;}/**
         * Builds the cache key for the picklist record type api
         * @returns A new cache key representing the Picklist record type value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");assert$1(this.recordTypeId,"A non-empty recordTypeId must be provided.");assert$1(this.recordTypeId.length===18,"Record Type Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this.objectApiName}${KEY_DELIM}${this.recordTypeId}`);}/**
         * Returns a PicklistRecordTypeCacheKeyBuilder based on a cacheKey. Throws an error if it can't be done because a bad string is provided.
         * @param cacheKey The cacheKey object for picklist recordtype.
         * @returns A PicklistRecordTypeCacheKeyBuilder based on a cacheKey.
         */static fromCacheKey(cacheKey){const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);{assert$1(localKeyParts.length===2,`localKeyParts did not have the required parts(objectApiName and recordTypeId): ${localKeyParts}`);assert$1(cacheKey.getValueType()===PICKLIST_VALUES_BY_RT_VALUE_TYPE,`valueType was expected to be PICKLIST_VALUES_BY_RT_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const builder=new PicklistValuesByRecordTypeCacheKeyBuilder();builder.setObjectApiName(localKeyParts[0]);builder.setRecordTypeId(localKeyParts[1]);return builder;}}/**
     * Provides functionality to read picklist data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for the PicklistsByRecordType value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class PicklistValuesByRecordTypeService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[PICKLIST_VALUES_BY_RT_VALUE_TYPE]);}getCacheValueTtl(){return PICKLIST_VALUES_BY_RECORD_TYPE_TTL;}/**
         * Gets picklist values for all picklist fields of an object and record type.
         * @param objectApiName API name of the object.
         * @param recordTypeId Record type id. Pass '012000000000000AAA' for the master record type.
         * @returns An observable of the picklist values.
         */getPicklistValuesByRecordType(objectApiName,recordTypeId){objectApiName=getObjectApiName(objectApiName);recordTypeId=to18(recordTypeId);const cacheKey=new PicklistValuesByRecordTypeCacheKeyBuilder().setObjectApiName(objectApiName).setRecordTypeId(recordTypeId).build();const vpArgs={cacheKey,objectApiName,recordTypeId,forceProvide:false};const observable=this._ldsCache.get(cacheKey,this._createPicklistValuesByRecordTypeValueProvider(vpArgs));return observable;}/**
         * Stage puts the given picklistsByRecordType and all its normalized values.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param picklistsByRecordType The picklistsByRecordType to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,picklistsByRecordType,cacheAccessor,additionalData){const stagePutThenables=[];const picklistsByRecordTypeCacheKey=new PicklistValuesByRecordTypeCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).build();const normalizedPicklistsByRecordType=clone(picklistsByRecordType,picklistsByRecordTypeCacheKey);// Picklist normalization
    const picklistFieldValues=normalizedPicklistsByRecordType.picklistFieldValues;const picklistFieldValuesKeys=Object.keys(picklistFieldValues);for(let n=0,len=picklistFieldValuesKeys.length;n<len;++n){const picklistFieldName=picklistFieldValuesKeys[n];const picklist=picklistsByRecordType.picklistFieldValues[picklistFieldName];picklistFieldValues[picklistFieldName]=new PicklistValuesCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setETag(picklist.eTag).build();const picklistValuesStagePutAdditionalData={objectApiName:additionalData.objectApiName,recordTypeId:additionalData.recordTypeId,fieldApiName:picklistFieldName};stagePutThenables.push(this._ldsCache.stagePutValue(PICKLIST_VALUES_VALUE_TYPE,[picklistsByRecordTypeCacheKey],picklist,cacheAccessor,picklistValuesStagePutAdditionalData));}return Thenable.all(stagePutThenables).then(()=>{// Stage put the picklistsByRecordType
    // Strip out the eTag from the value. We don't want to emit eTags!
    delete normalizedPicklistsByRecordType.eTag;picklistsByRecordType=this.stripETagsFromValue(picklistsByRecordType);// PicklistsByRecordType will not store an eTag because it is an aggregate value.
    return cacheAccessor.stagePut(dependentCacheKeys,picklistsByRecordTypeCacheKey,normalizedPicklistsByRecordType,picklistsByRecordType);});}/**
         * Strips all eTag properties from the given picklistsByRecordType by directly deleting them.
         * @param picklistsByRecordType The picklists for a recordtype.
         * @returns The given picklistsByRecordType with its eTags stripped.
         */stripETagsFromValue(picklistsByRecordType){// Delete the eTag off the root object.
    delete picklistsByRecordType.eTag;// Delete the eTags for each picklist.
    const picklistFieldValues=picklistsByRecordType.picklistFieldValues;const picklistFieldValuesKeys=Object.keys(picklistFieldValues);for(let n=0,len=picklistFieldValuesKeys.length;n<len;++n){const picklistFieldValueKey=picklistFieldValuesKeys[n];const picklist=picklistFieldValues[picklistFieldValueKey];picklistFieldValues[picklistFieldValueKey]=this._ldsCache.stripETagsFromValue(PICKLIST_VALUES_VALUE_TYPE,picklist);}return picklistsByRecordType;}/**
         * @returns The affected key handler for this service.
         */getAffectedKeyHandler(){return (affectedKey,cacheAccessor)=>{const affectedKeyValueType=affectedKey.getValueType();{assert$1(affectedKeyValueType===PICKLIST_VALUES_BY_RT_VALUE_TYPE,`Unexpected value type for Record: ${affectedKeyValueType===undefined?"undefined":affectedKeyValueType.toString()}`);}const keyBuilder=PicklistValuesByRecordTypeCacheKeyBuilder.fromCacheKey(affectedKey);const objectApiName=keyBuilder.getObjectApiName();const recordTypeId=keyBuilder.getRecordTypeId();// When one of the picklists fields have changed, need to do a full refresh of the picklistsByRecordType. This
    // handler will only ever be invoked if a picklist field value has actually changed so we don't need to
    // check anything, just kick off a refresh.
    // Kick this to a Promise to get this out of the cache operation we're already in the middle of.
    return Promise.resolve().then(()=>{const forceProvide=true;const vpArgs={cacheKey:affectedKey,objectApiName,recordTypeId,forceProvide};// Use the ValueProvider's provider instead of getPicklistValuesByRecordType() so we can force value providing.
    this._ldsCache.get(affectedKey,this._createPicklistValuesByRecordTypeValueProvider(vpArgs));});};}/**
         * Constructs a value provider to retrieve all picklist values for a record type.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve picklist by record type values.
         */_createPicklistValuesByRecordTypeValueProvider(valueProviderParameters){const{// Do NOT set defaults here. See W-4840393.
    cacheKey,objectApiName,recordTypeId,forceProvide}=valueProviderParameters;const picklistsByRecordTypeValueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+PICKLIST_VALUES_BY_RECORD_TYPE_TTL;if(needsRefresh){// Value is stale, get a fresh value.
    // return this._getFreshPicklistsByRecordTypeValue(cacheAccessor, cacheKey, objectApiName, recordTypeId, existingValueWrapper.eTag);
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value, get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId);});},valueProviderParameters);return picklistsByRecordTypeValueProvider;}/**
         * Gets a fresh value for pickists by record type and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the picklistsByRecordTypeValue.
         * @param objectApiName The objectApiName of the picklistsByRecordTypeValue.
         * @param recordTypeId The recordTypeId of the picklistsByRecordTypeValue.
         * @returns Returns a ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,recordTypeId){let picklistValuesByRecordTypeThenable;const params={objectApiName,recordTypeId};if(transportUtils.useAggregateUi){picklistValuesByRecordTypeThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getPicklistValuesByRecordType",params,PICKLIST_VALUES_BY_RECORD_TYPE_TTL);}else{picklistValuesByRecordTypeThenable=executeAuraGlobalController("RecordUiController.getPicklistValuesByRecordType",params);}return picklistValuesByRecordTypeThenable.then(transportResponse=>{// Cache miss.
    const freshPicklistsByRecordType=transportResponse.body;this.stagePutValue([],freshPicklistsByRecordType,cacheAccessor,{objectApiName,recordTypeId});}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Wire adapter id: getPicklistValuesByRecordType.
     * @throws Always throws an error when invoked. Imperative invocation is not supported.
     */function getPicklistValuesByRecordType(){throw generateError("getPicklistValuesByRecordType");}/**
     * Generates the wire adapters for:
     * @wire getPicklistValuesByRecordType
     */class PicklistValuesByRecordTypeWireAdapterGenerator{/**
         * Constructor.
         * @param picklistValuesByRecordTypeService Reference to the PicklistValuesByRecordTypeService instance.
         */constructor(picklistValuesByRecordTypeService){this._picklistValuesByRecordTypeService=picklistValuesByRecordTypeService;}/**
         * Generates the wire adapter for @wire getPicklistValuesByRecordType.
         * @returns Returns the generated wire adapter for getPicklistValuesByRecordType
         */generateGetPicklistValuesByRecordTypeWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetPicklistValuesByRecordType.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Services getPicklistValuesByRecordType @wire.
         * @param config Config params for the service.
         * @return Observable stream that emits a picklist values by record type object.
         */serviceGetPicklistValuesByRecordType(config){if(!config){return undefined;}{const required=["objectApiName","recordTypeId"];const supported=["objectApiName","recordTypeId"];validateConfig("getPicklistValuesByRecordType",config,required,supported);}if(!config.objectApiName||!config.recordTypeId){return undefined;}return this._picklistValuesByRecordTypeService.getPicklistValuesByRecordType(config.objectApiName,config.recordTypeId);}}/**
     * The valueType to use when building RecordAvatarsCacheKeyBuilder.
     */const RECORD_AVATAR_BULK_VALUE_TYPE="uiapi.RecordAvatarBulk";/**
     * Time to live for the RecordAvatars cache value. 5 minutes.
     */const RECORD_AVATAR_BULK_TTL=5*60*1000;/**
     * Constructs a cache key for the RecordAvatars value type. Keys are constructed from:
     * - recordIds
     */class RecordAvatarBulkCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(RECORD_AVATAR_BULK_VALUE_TYPE);}/**
         * Sets the recordId for the cache key.
         * @param recordIds An array of recordIds.
         * @returns The current object. Useful for chaining method calls.
         */setRecordIds(recordIds){this.recordIds=recordIds;return this;}/**
         * Builds the cache key.
         * @returns A new cache key representing the RecordAvatars value type.
         */build(){{assert$1(this.recordIds.length,"A non-empty recordIds must be provided.");}return new CacheKey(this.getValueType(),`${JSON.stringify(this.recordIds)}`);}}/**
     * Constructs a cache key for the RecordAvatar value type. Keys are constructed from:
     * - recordId
     */class RecordAvatarCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(RECORD_AVATAR_VALUE_TYPE);}/**
         * Sets the recordId for the cache key.
         * @param recordId The recordId.
         * @returns The current object. Useful for chaining method calls.
         */setRecordId(recordId){this.recordId=recordId;return this;}/**
         * Builds the cache key.
         * @returns CacheKey - A new cache key representing the RecordAvatar value type.
         */build(){{assert$1(this.recordId,"A non-empty recordId must be provided.");}return new CacheKey(this.getValueType(),`${this.recordId}`);}}/**
     * Provides functionality to read record avatar data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for this value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class RecordAvatarService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[RECORD_AVATAR_VALUE_TYPE]);}getCacheValueTtl(){return RECORD_AVATAR_TTL;}/**
         * Stage puts the given recordAvatar.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param recordAvatar The recordAvatar to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,recordAvatar,cacheAccessor,additionalData){const recordAvatarCacheKey=new RecordAvatarCacheKeyBuilder().setRecordId(additionalData.recordAvatarId).build();return cacheAccessor.get(recordAvatarCacheKey).then(existingRecordAvatarValueWrapper=>{let eTag;if(recordAvatar.result.eTag){eTag=recordAvatar.result.eTag;}if(existingRecordAvatarValueWrapper&&existingRecordAvatarValueWrapper.eTag===eTag){return cacheAccessor.stagePutUpdateLastFetchTime(recordAvatarCacheKey);}// Strip out the eTag from the value. We don't want to emit eTags!
    recordAvatar=this.stripETagsFromValue(recordAvatar);return cacheAccessor.stagePut(dependentCacheKeys,recordAvatarCacheKey,recordAvatar,recordAvatar,{eTag});});}/**
         * Strips all eTag properties from the given recordAvatar by directly deleting them.
         * @param recordAvatar The recordAvatar from which to strip the eTags.
         * @returns The given recordAvatar with its eTags stripped.
         */stripETagsFromValue(recordAvatar){delete recordAvatar.result.eTag;return recordAvatar;}}/**
     * Represents an object that is used as a record avatar normalization marker.
     */class RecordAvatarCacheValueMarker extends CacheValueMarker{constructor(timestamp,id,eTag){super(timestamp);this.id=id;this.eTag=eTag;}}/**
     * Constructs a RecordAvatarCacheValueMarker.
     */class RecordAvatarCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Set the id for the record avatar cache value marker builder.
         * @param id
         */setId(id){this._id=id;return this;}/**
         * Set the eTag for the record avatar cache value marker builder.
         * @param eTag
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Builds the record avatar cache value marker.
         * @returns A new record avatar cache value marker.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._id,"A non-empty record id must be set.");}return new RecordAvatarCacheValueMarker(this._timestamp,this._id,this._eTag);}}/**
     * Transforms and returns the given RecordAvatarBulk into RecordAvatarRepresentations.
     * This is a shallow copy of RecordAvatarRepresentation entries contained in the provided RecordAvatarBulk
     * @param recordAvatarBulk The instance of RecordAvatarBulk to transform into a RecordAvatarRepresentations.
     * @returns RecordAvatarRepresentations transformed from the provided RecordAvatarBulk
     */function createRecordAvatarRepresentationsFromRecordAvatarBulk(recordAvatarBulk){const results=[];let hasErrors=false;for(const key in recordAvatarBulk){results.push(recordAvatarBulk[key]);if(recordAvatarBulk[key].statusCode!==200){hasErrors=true;}}return {hasErrors,results};}/**
     * Transforms the given RecordAvatarRepresentations into a RecordAvatarBulk using the provided recordAvatarIds
     * This is a shallow copy of RecordAvatarRepresentation entries contained in the provided RecordAvatarRepresentations
     * @param freshRecordAvatarsValue Instance of RecordAvatarRepresentations to index based on recordAvatarIds
     * @param recordAvatarIds Ids to index new RecordAvatarBulk with
     * @returns RecordAvatarBulk instance transformed from the args
     */function createRecordAvatarBulkFromRecordAvatarRepresentations(freshRecordAvatarsValue,recordAvatarIds){const recordAvatarBulk={};for(let len=freshRecordAvatarsValue.results.length,n=0;n<len;n++){const recordAvatarId=recordAvatarIds[n];const recordAvatarRepresentation=freshRecordAvatarsValue.results[n];recordAvatarBulk[recordAvatarId]=recordAvatarRepresentation;}return recordAvatarBulk;}/**
     * Provides functionality to read record avatar data from the cache. Can refresh the data from the server.
     * We do not utilize caching or sending eTags to the server for this value type because it gets invalidated
     * quickly on the client from having its atoms updated.
     */class RecordAvatarBulkService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[RECORD_AVATAR_BULK_VALUE_TYPE]);}getCacheValueTtl(){return RECORD_AVATAR_BULK_TTL;}/**
         * Retrieves avatars specified for the specified record Ids.
         * @param recordIds The array of record ids.
         * @returns An observable for the avatar values specified by the given parameters.
         */getRecordAvatars(recordIds){// Remove any duplicates and sort the recordIds.
    // We sort so that same set of recordIds specified in any order results in the same avatar group key.
    let uniqueRecordIds=collectionToArray(new Set(recordIds)).sort();uniqueRecordIds=uniqueRecordIds.map(to18);// Build key for the avatars group key.
    const recordAvatarBulkCacheKey=new RecordAvatarBulkCacheKeyBuilder().setRecordIds(uniqueRecordIds).build();const vpArgs={recordIds:uniqueRecordIds,cacheKey:recordAvatarBulkCacheKey,forceProvide:false};return this._ldsCache.get(recordAvatarBulkCacheKey,this._createRecordAvatarBulkValueProvider(vpArgs));}/**
         * Stage put the recordAvatars.
         * Usage Example: This is used by record-layouts module to store the avatars it fetches into the cache.
         * @param dependentCacheKeys An array of dependent cache keys which depend on this stage put.
         * @param recordAvatars Object with a results array of objects representing avatars
         *      results[0].result = result_avatar_for_001xx12345
         *      results[1].result = result_avatar_for_005xx56789
         *      results[2].result = result_404
         * @param cacheAccessor Cache Accessor used in the scope of this operation.
         * @param additionalData bag of required data for stagePut. Expects the following:
         *      {
         *          recordIds: string[]
         *      }
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,recordAvatars,cacheAccessor,additionalData){if(recordAvatars&&recordAvatars.results&&recordAvatars.results.length){// Avenues exist that do not send this along. That's *okay*, we can deal with it by inspecting the inbound information.
    // The natural format of recordAvatarBulk is RecordAvatarRepresentations. As of 218 some paths do not return this from the server.
    // ones that DO return this format, in case of error, do not include the recordId of the RecordAvatarInvalidResult
    if(!additionalData||!additionalData.recordAvatarIds||!additionalData.recordAvatarIds.length){const recordIds=[];for(let idx=0,len=recordAvatars.results.length;idx<len;idx++){const anAvatar=recordAvatars.results[idx];if(anAvatar.statusCode===200){const validResult=anAvatar.result;recordIds.push(validResult.recordId);}else{// If the status code is !== 200, there was a problem, which means there's NO associated recordId with this data
    // we presently have no choice but to skip putting this entry unless RecordAvatarInvalidResult entries begin to include recordId data from the services
    recordAvatars.results.splice(idx,1);idx--;len--;}}additionalData={recordAvatarIds:recordIds};}if(additionalData.recordAvatarIds.length){const recordAvatarBulk=createRecordAvatarBulkFromRecordAvatarRepresentations(recordAvatars,additionalData.recordAvatarIds);const recordAvatarBulkCacheKey=new RecordAvatarBulkCacheKeyBuilder().setRecordIds(additionalData.recordAvatarIds).build();this._normalizeAndStagePutRecordAvatarBulk(dependentCacheKeys,recordAvatarBulk,cacheAccessor,recordAvatarBulkCacheKey);}}return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given recordAvatarBulk by directly deleting them.
         * @param recordAvatarBulk The recordAvatarBulk from which to strip the eTags.
         * @returns The given recordAvatarBulk with its eTags stripped.
         */stripETagsFromValue(recordAvatarBulk){const recordIds=Object.keys(recordAvatarBulk);for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const recordAvatar=recordAvatarBulk[recordId];recordAvatarBulk[recordId]=this._ldsCache.stripETagsFromValue(RECORD_AVATAR_VALUE_TYPE,recordAvatar);}return recordAvatarBulk;}/**
         * @returns The affected key handler for this service.
         */getAffectedKeyHandler(){return (avatarsAffectedKey,cacheAccessor)=>{{assert$1(avatarsAffectedKey.getValueType()===RECORD_AVATAR_BULK_VALUE_TYPE,`Unexpected value type: ${avatarsAffectedKey.getValueType().toString()}`);}return ThenableFactory.resolve(undefined).then(()=>{// Get avatars group normed value. This will have markers for each avatar.
    return cacheAccessor.get(avatarsAffectedKey);}).then(avatarsWrapper=>{const avatarsWrapperValue=avatarsWrapper.value;{assert$1(avatarsWrapper,`avatarsWrapper is falsy`);assert$1(avatarsWrapperValue,`avatarsWrapperValue is falsy ${avatarsWrapperValue}`);}if(avatarsWrapper&&avatarsWrapperValue){// Denorm value (replace marker for each avatar with actual value) and stageemit.
    this._denormalizeAvatars(avatarsWrapperValue,cacheAccessor).then(({emitDenormedAvatars,denormedAvatars})=>{if(emitDenormedAvatars){// Avatars has changed, so stageEmit.
    const recordAvatarsValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(avatarsWrapper,denormedAvatars);cacheAccessor.stageEmit(avatarsAffectedKey,recordAvatarsValueWrapperToEmit);}});}});};}/**
         * Constructs a valueProvider to retrieve Avatars for a group of recordIds and cache them if there is a CACHE_MISS.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns Value Provider to retrieve Avatars.
         */_createRecordAvatarBulkValueProvider(valueProviderParameters){const{cacheKey,recordIds,forceProvide}=valueProviderParameters;const recordAvatarBulkValueProvider=new ValueProvider(cacheAccessor=>{if(forceProvide){// Here we refresh all individual avatars.
    const cachedRecordAvatarBulk={};return this._getFreshValue(cacheAccessor,cacheKey,recordIds,cachedRecordAvatarBulk);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){// We have the record avatar bulk value already in the cache.
    const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry.
    const needsRefresh=nowTime>lastFetchTime+RECORD_AVATAR_BULK_TTL;if(needsRefresh){// TTL for avatars group value has expired. Refresh individual avatars within group whose TTL has expired.
    // Pass false for useCacheIndividualAvatarsWithoutCheckingTtl so that we only use individual avatars that have not expired.
    return this._getRecordAvatarIdsToFetchFromServer(recordIds,cacheAccessor,false).then(recordAvatarIdsToFetchAndRecordAvatarBulkInCache=>{return this._getFreshValue(cacheAccessor,cacheKey,recordAvatarIdsToFetchAndRecordAvatarBulkInCache.recordIdsToFetch,recordAvatarIdsToFetchAndRecordAvatarBulkInCache.cachedRecordAvatarBulk);});}return ValueProviderResult.CACHE_HIT;}// We do not have this avatars value in cache. Determine which individual avatar values we already have.
    // Pass true for useCacheIndividualAvatarsWithoutCheckingTtl. In this case, we use individual avatar values from cache as long without checking ttl.
    return this._getRecordAvatarIdsToFetchFromServer(recordIds,cacheAccessor,true).then(recordIdsToFetchAndRecordAvatarsInCache=>{return this._getFreshValue(cacheAccessor,cacheKey,recordIdsToFetchAndRecordAvatarsInCache.recordIdsToFetch,recordIdsToFetchAndRecordAvatarsInCache.cachedRecordAvatarBulk);});});},valueProviderParameters);return recordAvatarBulkValueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the recordAvatars.
         * @param recordIds The list of record ids for the recordAvatars.
         * @param recordIdsToFetch The list of record ids identifying which record avatars to fetch from the server.
         * @param cachedRecordAvatarBulk The list of record ids identifying which record avatars are already in cache and should be COMBINED with the response from the server.
         * @returns Returns a thenable representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,recordIdsToFetch,cachedRecordAvatarBulk){let transportResponseThenable;const params={recordIds:recordIdsToFetch};if(recordIdsToFetch.length>0){// If we need to fetch any from the server.
    if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getRecordAvatars",params,RECORD_AVATAR_BULK_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getRecordAvatars",params);}}else{// We did not need to fetch any from server. Set to empty.
    const results=[];transportResponseThenable=ThenableFactory.resolve(getOkTransportResponse({results}));}return transportResponseThenable.then(transportResponse=>{// Cache miss.
    const freshRecordAvatarsValue=transportResponse.body;// Transform the response into the shape cached by LDS and normalize it.
    let recordAvatarBulk=createRecordAvatarBulkFromRecordAvatarRepresentations(freshRecordAvatarsValue,recordIdsToFetch);recordAvatarBulk=Object.assign(recordAvatarBulk,cachedRecordAvatarBulk);this._normalizeAndStagePutRecordAvatarBulk([],recordAvatarBulk,cacheAccessor,cacheKey);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{{// tslint:disable-next-line:no-console
    console.log(rejectionReason);}throw rejectionReason;});}/**
         * Takes the denormalized avatars and normalizes it.
         * Then stagePuts the normalized group avatar and the individual avatars.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param recordAvatarBulk The denormalized avatars to be cached.
         * @param cacheAccessor Cache Accessor reference.
         * @param recordAvatarBulkCacheKey The cache key for the group avatar.
         * @returns A Thenable that resolves to an array of cache keys for avatars that are cached or refreshed
         * as a result of this operation.
         */_normalizeAndStagePutRecordAvatarBulk(dependentCacheKeys,recordAvatarBulk,cacheAccessor,recordAvatarBulkCacheKey){const normalizedRecordAvatarBulk=clone(recordAvatarBulk);const stagePutThenables=[];// Stage put the individual avatar entries.
    const recordAvatarIds=Object.keys(normalizedRecordAvatarBulk);for(let len=recordAvatarIds.length,n=0;n<len;n++){const recordAvatarRecordId=recordAvatarIds[n];const recordAvatar=recordAvatarBulk[recordAvatarRecordId];// Replace avatar value with marker. Include id and eTag in the marker.
    normalizedRecordAvatarBulk[recordAvatarRecordId]=new RecordAvatarCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setId(recordAvatarRecordId).setETag(recordAvatar.result.eTag).build();const recordAvatarStagePutAdditionalData={recordAvatarId:recordAvatarRecordId};stagePutThenables.push(this._ldsCache.stagePutValue(RECORD_AVATAR_VALUE_TYPE,[recordAvatarBulkCacheKey],recordAvatar,cacheAccessor,recordAvatarStagePutAdditionalData));}// Stage put the normalized bulk object.
    return Thenable.all(stagePutThenables).then(()=>{recordAvatarBulk=this.stripETagsFromValue(recordAvatarBulk);cacheAccessor.stagePut([],recordAvatarBulkCacheKey,normalizedRecordAvatarBulk,recordAvatarBulk);return normalizedRecordAvatarBulk;}).catch(rejectionReason=>{const errMsg=`_normalizeAndStagePutRecordAvatarBulk() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}throw errMsg;});}/**
         * Denormalize the normalizedAvatars.
         * @param normalizedAvatars The normalized group avatar.
         * @param affectedKey The key that we are denormalizing.
         * @param cacheAccessor The cacheAccessor used in scope for this operation.
         * @returns The Thenable that will resolve to the denormalized avatars or undefined if a nested avatar cannot be found in the cache.
         */_denormalizeAvatars(normalizedAvatars,cacheAccessor){const thenables=[];const denormedAvatars={};let emitDenormedAvatars=false;const avatarRecordIds=Object.keys(normalizedAvatars);function setEmitDenormedAvatars(){emitDenormedAvatars=true;}for(let len=avatarRecordIds.length,n=0;n<len;n++){const avatarRecordId=avatarRecordIds[n];const avatarMarker=normalizedAvatars[avatarRecordId];{// Build a key for the avatar.
    assert$1(avatarMarker.id,"Did not find id for avatar");assert$1(cacheValueMarkerUtils.isMarker(avatarMarker),"Did not find marker property for avatar");}const avatarCacheKey=new RecordAvatarCacheKeyBuilder().setRecordId(avatarMarker.id).build();thenables.push(cacheAccessor.get(avatarCacheKey).then(avatar=>{if(!avatar){return ThenableFactory.reject(getLdsInternalError("AVATAR_NOT_FOUND",`Did not find avatar for '${avatarCacheKey.getKey()}''}`,true));}const avatarValue=avatar.value;{assert$1(avatarValue,"avatar.value was falsy");}if(avatarValue.result.eTag!==avatarMarker.eTag){setEmitDenormedAvatars();}// Individual avatar values are frozen in cache, so clone will optimize and return same value here.
    denormedAvatars[avatarRecordId]=clone(avatarValue,avatarCacheKey);return Thenable.resolve(undefined);}));}return Thenable.all(thenables).then(()=>{const emitFlagWithDenormedAvatars={emitDenormedAvatars,denormedAvatars};return emitFlagWithDenormedAvatars;});}/**
         * From the parameter specifying a list of all recordIds that we need avatars for,
         * this function returns
         *  1) A list of recordIds that need their avatars fetched from the server.
         *  2) For values that already exist in the cache, it returns recordIdAvatarsInCache as below
         *       recordIdAvatarsInCache["001xx12345"] = avatar_for_001xx12345
         *       recordIdAvatarsInCache["005xx55667"] = avatar_for_005xx55667
         * Values in cache as checked for ttl based on th ignoreTtl flag.
         * @param recordIds An array of recordIds we need avatars for.
         * @param cacheAccessor Cache Accessor used in the scope of this operation.
         * @param useCacheIndividualAvatarsWithoutCheckingTtl True if we need to use values from cache ignoring their ttl.
         * @returns Thenable resolves to an object {recordIdsToFetch, recordIdAvatarsInCache} - See description.
         */_getRecordAvatarIdsToFetchFromServer(recordIds,cacheAccessor,useCacheIndividualAvatarsWithoutCheckingTtl){const thenables=[];const recordIdsToFetch=[];const recordAvatarBulkFromCache={};for(let len=recordIds.length,n=0;n<len;n++){const recordId=recordIds[n];const avatarCacheKey=new RecordAvatarCacheKeyBuilder().setRecordId(recordId).build();thenables.push(cacheAccessor.get(avatarCacheKey).then(recordAvatarWrapper=>{let fetch=true;const avatarWrapperValue=recordAvatarWrapper!==undefined?recordAvatarWrapper.value:undefined;if(avatarWrapperValue!==undefined){// We have a avatar value in cache.
    if(useCacheIndividualAvatarsWithoutCheckingTtl){// We do not care about ttl. Since value in cache is available, set fetch to false.
    fetch=false;}else{// We care about ttl expired.
    const nowTime=cacheAccessor.nowTime;const lastFetchTime=recordAvatarWrapper.lastFetchTime;// check for ttl expiry. If expiree, refresh individual avatars whose TTL has expired.
    const needsRefresh=nowTime>lastFetchTime+RECORD_AVATAR_BULK_TTL;if(!needsRefresh){fetch=false;// We have avatar and ttl has not expired.
    }}}if(fetch){recordIdsToFetch.push(recordId);}else{recordAvatarBulkFromCache[recordId]=avatarWrapperValue;}}));}return Thenable.all(thenables).then(()=>{const recordIdsToFetchAndRecordAvatarsInCache={recordIdsToFetch,cachedRecordAvatarBulk:recordAvatarBulkFromCache};return recordIdsToFetchAndRecordAvatarsInCache;});}}/**
     * Wire adapter id: getRecordAvatars.
     * @throws Always throws when invoked. Imperative invocation is not supported.
     */function getRecordAvatars(){throw generateError("getRecordAvatars");}/**
     * Generates the wire adapters for:
     *      * @wire getRecordAvatars
     */class RecordAvatarBulkWireAdapterGenerator{/**
         * Constructor.
         * @param recordAvatarBulkService Reference to the RecordAvatarBulkService instance.
         */constructor(recordAvatarBulkService){this._recordAvatarBulkService=recordAvatarBulkService;}/**
         * Generates the wire adapter for @wire getRecordAvatars.
         * @returns See description.
         */generateGetRecordAvatarsWireAdapter(){const wireAdapter=generateWireAdapter(this.serviceGetRecordAvatars.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Service getRecordAvatars @wire.
         * @param config Config params for the service.
         * @return Observable stream that emits a record avatars object.
         */serviceGetRecordAvatars(config){if(!config||!config.recordIds){return undefined;}return this._recordAvatarBulkService.getRecordAvatars(config.recordIds);}}/**
     * Constructs a cache key for the RecordCreateDefaults value type.
     */class RecordCreateDefaultsCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor.
         */constructor(){super(RECORD_CREATE_DEFAULTS_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName.toLowerCase();return this;}/**
         * @returns The objectApiName assigned on the builder.
         */getObjectApiName(){return this._objectApiName;}/**
         * Sets the formFactor for the cache key.
         * @param formFactor The form factor.
         * @returns The current object. Useful for chaining method calls.
         */setFormFactor(formFactor){this._formFactor=formFactor.toLowerCase();return this;}/**
         * @returns The formFactor assigned on the builder.
         */getFormFactor(){return this._formFactor;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The record type id.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * @returns Returns the recordTypeId assigned on the builder.
         */getRecordTypeId(){return this._recordTypeId;}/**
         * Sets the optionalFields for the cache key.
         * @param optionalFields The list of optional fields.
         * @returns The current object. Useful for chaining method calls.
         */setOptionalFields(optionalFields){this._optionalFields=optionalFields.sort();return this;}/**
         * @returns Returns the optionalFields assigned on the builder.
         */getOptionalFields(){return this._optionalFields;}/**
         * Builds the cache key.
         * @returns A new cache key representing the RecordCreateDefaults value type.
         */build(){function errorFormatter(literals,key,valueFound,singleValue){let base=`${key} should be a string list, but received ${valueFound}`;if(singleValue){base+=`, list contains an entry with value ${singleValue}`;}return base;}function constructKeyFromStringList(key,list){if(list===undefined){return "";}{list.forEach(field=>{assert$1(field,errorFormatter`${key}${list}${field}`);});}return list.join(",");}{if(this._recordTypeId){assert$1(this._recordTypeId.length===18,"Record Type Id length should be 18 characters.");}}const cacheKeyPartFormFactor=this._formFactor?this._formFactor:"Large";const cacheKeyPartRecordTypeId=this._recordTypeId?this._recordTypeId:MASTER_RECORD_TYPE_ID;const cacheKeyPartOptionalFields=constructKeyFromStringList("optionalFields",this._optionalFields);return new CacheKey(this.getValueType(),`${this._objectApiName}${KEY_DELIM}${cacheKeyPartFormFactor}${KEY_DELIM}${cacheKeyPartRecordTypeId}${KEY_DELIM}${cacheKeyPartOptionalFields}`);}/**
         * Returns a RecordCreateDefaultsCacheKeyBuilder based on a CacheKey.
         * @param cacheKey A cache key string derived from a RecordCreateDefaults CacheKey.
         * @returns See description.
         * @throws An error if a RecordCreateDefaultsCacheKeyBuilder cannot be created because a bad string is provided.
         */static fromCacheKey(cacheKey){{assert$1(cacheKey.getValueType()===RECORD_CREATE_DEFAULTS_VALUE_TYPE,`valueType was expected to be RECORD_CREATE_DEFAULTS_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);const builder=new RecordCreateDefaultsCacheKeyBuilder();builder.setObjectApiName(localKeyParts[0]);builder.setFormFactor(localKeyParts[1]);builder.setRecordTypeId(localKeyParts[2]);const optionalFields=localKeyParts[3]===""?[]:localKeyParts[3].split(",");builder.setOptionalFields(optionalFields);return builder;}}/**
     * Provides functionality to read record create defaults data from the cache. Can refresh the data from the server.
     */class RecordDefaultsService extends LdsServiceBase{/*
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[RECORD_CREATE_DEFAULTS_VALUE_TYPE]);}getCacheValueTtl(){return RECORD_CREATE_DEFAULTS_TTL;}/**
         * Gets record create default values.
         * @param objectApiName API name of the object.
         * @param formFactor Form factor. Possible values are 'Small', 'Medium', 'Large'. Large is default.
         * @param recordTypeId Record type id.
         * @param optionalFields Qualified field API names. If any are inaccessible then they are silently omitted.
         * @returns An observable of record create default values.
         */getRecordCreateDefaults(objectApiName,formFactor,recordTypeId,optionalFields){// Process arguments and check for validity.
    objectApiName=getObjectApiName(objectApiName);const processedOptionalFields=(optionalFields||[]).map(getFieldApiName);if(formFactor!==undefined&&typeof formFactor!=="string"){throw new TypeError(`Expected to get a string for formFactor but instead got ${formFactor}`);}formFactor=formFactor||"Large";if(recordTypeId!==undefined&&typeof recordTypeId!=="string"){throw new TypeError(`Expected to get a string for recordTypeId but instead got ${recordTypeId}`);}recordTypeId=recordTypeId?to18(recordTypeId):MASTER_RECORD_TYPE_ID;const cacheKey=new RecordCreateDefaultsCacheKeyBuilder().setObjectApiName(objectApiName).setFormFactor(formFactor).setRecordTypeId(recordTypeId).setOptionalFields(processedOptionalFields).build();const valueProviderParameters={cacheKey,objectApiName,formFactor,recordTypeId,optionalFields:processedOptionalFields,forceProvide:false};const valueProvider=this._createRecordDefaultsValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/*
         * Stage puts the given recordAvatar.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param recordAvatar The recordAvatar to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,recordCreateDefaults,cacheAccessor,additionalData){const recordCreateDefaultsCacheKey=new RecordCreateDefaultsCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setFormFactor(additionalData.formFactor).setRecordTypeId(additionalData.recordTypeId).setOptionalFields(additionalData.optionalFields).build();return this._normalizeAndStagePutRecordCreateDefaults(recordCreateDefaults,cacheAccessor,recordCreateDefaultsCacheKey,dependentCacheKeys).then(()=>{return;});}/**
         * Strips all eTag properties from the given recordCreateDefaults by directly deleting them.
         * @param recordCreateDefaults The recordCreateDefaults from which to strip the eTags.
         * @returns recordCreateDefaults with its eTags stripped.
         */stripETagsFromValue(recordCreateDefaults){delete recordCreateDefaults.eTag;// Strip eTags from object infos.
    const objectInfos=recordCreateDefaults.objectInfos;const objectApiNames=Object.keys(objectInfos);for(let len=objectApiNames.length,n=0;n<len;++n){const objectApiName=objectApiNames[n];const objectInfo=objectInfos[objectApiName];objectInfos[objectApiName]=this._ldsCache.stripETagsFromValue(OBJECT_INFO_VALUE_TYPE,objectInfo);}// Strip eTags from layout.
    const layout=recordCreateDefaults.layout;recordCreateDefaults.layout=this._ldsCache.stripETagsFromValue(LAYOUT_VALUE_TYPE,layout);// Strip eTags from record.
    const record=recordCreateDefaults.record;recordCreateDefaults.record=this._ldsCache.stripETagsFromValue(RECORD_VALUE_TYPE,record);return recordCreateDefaults;}/**
         * @returns The affected key handler for this service.
         */getAffectedKeyHandler(){return (affectedKey,cacheAccessor)=>{{assert$1(affectedKey.getValueType()===RECORD_CREATE_DEFAULTS_VALUE_TYPE,`Expected RECORD_CREATE_DEFAULTS_VALUE_TYPE value type for RecordCreateDefaults: ${affectedKey.getValueType().toString()}`);}return Thenable.resolve().then(()=>{const keyBuilder=RecordCreateDefaultsCacheKeyBuilder.fromCacheKey(affectedKey);const objectApiName=keyBuilder.getObjectApiName();const formFactor=keyBuilder.getFormFactor();const recordTypeId=keyBuilder.getRecordTypeId();const optionalFields=keyBuilder.getOptionalFields();// We need to refresh, but we're already in a cache transaction. Kick this to a Promise to get this out of the cache operation we're
    // already in the middle of.
    Promise.resolve().then(()=>{const valueProviderParameters={cacheKey:affectedKey,objectApiName,formFactor,recordTypeId,optionalFields,forceProvide:true};const valueProvider=this._createRecordDefaultsValueProvider(valueProviderParameters);this._ldsCache.get(affectedKey,valueProvider);});});};}/**
         * Constructs a value provider to retrieve record default values.
         * @param valueProviderParameters: Parameters for the record create defaults value provider.
         * @returns The value provider to retrieve record defaults.
         */_createRecordDefaultsValueProvider(valueProviderParameters){const valueProvider=new ValueProvider((cacheAccessor,valueProviderParams)=>{const{cacheKey,objectApiName,formFactor,recordTypeId,optionalFields,forceProvide}=valueProviderParams;if(forceProvide){return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,formFactor,recordTypeId,optionalFields);}return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){// Determine if the value in the cache needs a refresh.
    const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+RECORD_CREATE_DEFAULTS_TTL;if(needsRefresh){// Value is stale, get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,formFactor,recordTypeId,optionalFields);}// Value is not stale, but we still need to validate it.
    return this._validateRecordCreateDefaultsCacheValue(cacheAccessor,existingValueWrapper.value).then(isValid=>{if(isValid){// Value contained in the cache is determined to be valid so return a cache hit!
    return ValueProviderResult.CACHE_HIT;}// Existing value is not valid; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,formFactor,recordTypeId,optionalFields);});}// No existing value; get a fresh value.
    return this._getFreshValue(cacheAccessor,cacheKey,objectApiName,formFactor,recordTypeId,optionalFields);});},valueProviderParameters);return valueProvider;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the recordCreateDefaults.
         * @param objectApiName The objectApiName of the recordCreateDefaults.
         * @param formFactor The formFactor of the recordCreateDefaults.
         * @param recordTypeId The recordTypeId of the recordCreateDefaults.
         * @param optionalFields The list of optional fields for the recordCreateDefaults.
         * @returns ValueProvider result representing the outcome of the value provider.
         */_getFreshValue(cacheAccessor,cacheKey,objectApiName,formFactor,recordTypeId,optionalFields){const params={objectApiName,formFactor,recordTypeId,optionalFields};let transportResponseThenable;if(transportUtils.useAggregateUi){transportResponseThenable=transportUtils.executeAuraGlobalControllerAggregateUi("getRecordCreateDefaults",params,RECORD_CREATE_DEFAULTS_TTL);}else{transportResponseThenable=executeAuraGlobalController("RecordUiController.getRecordCreateDefaults",params);}return transportResponseThenable.then(transportResponse=>{// Cache miss.
    const freshRecordCreateDefaults=transportResponse.body;cacheAccessor.stageClearDependencies(cacheKey);// Nothing should depend on this yet; included for completeness.
    return this.stagePutValue([],freshRecordCreateDefaults,cacheAccessor,{objectApiName,formFactor,recordTypeId,optionalFields});}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}/**
         * Returns true if the existing formUi cache value is valid, else false.
         * @param cacheAccessor The cacheAccessor.
         * @param normalizedRecordCreateDefaults The existing recordCreateDefaults cache value.
         * @returns See description.
         */_validateRecordCreateDefaultsCacheValue(cacheAccessor,normalizedRecordCreateDefaults){return this._denormalizeRecordCreateDefaults(normalizedRecordCreateDefaults,cacheAccessor).then(denormalizedRecordCreateDefaults=>{return !!denormalizedRecordCreateDefaults;});}/**
         * Denormalize record create defaults value.
         * @param normalizedRecordCreateDefaults RecordCreateDefaults normalized value.
         * @param cacheAccessor An object to access the cache directly.
         * @param recordCreateDefaultsCacheKey The cacheKey for the RecordCreateDefaults object.
         * @returns Thenable that resolves to the denormalized RecordCreateDefaults object or falsy if not defined or if denormalization couldn't find all the pieces.
         */_denormalizeRecordCreateDefaults(normalizedRecordCreateDefaults,cacheAccessor,recordCreateDefaultsCacheKey){const thenables=[];const denormalizedRecordCreateDefaults=clone(normalizedRecordCreateDefaults,recordCreateDefaultsCacheKey);// Denormalize object infos.
    Object.keys(normalizedRecordCreateDefaults.objectInfos).forEach(objectApiName=>{const objectInfoCacheKey=new ObjectInfoCacheKeyBuilder().setObjectApiName(objectApiName).build();thenables.push(cacheAccessor.get(objectInfoCacheKey).then(cachedObjectInfoValueWrapper=>{denormalizedRecordCreateDefaults.objectInfos[objectApiName]=cachedObjectInfoValueWrapper.value;}));});// Denormalize layout.
    const layoutCacheKey=new LayoutCacheKeyBuilder().setObjectApiName(normalizedRecordCreateDefaults.layout.objectApiName).setRecordTypeId(normalizedRecordCreateDefaults.layout.recordTypeId).setLayoutType(normalizedRecordCreateDefaults.layout.layoutType).setMode(normalizedRecordCreateDefaults.layout.mode).build();thenables.push(cacheAccessor.get(layoutCacheKey).then(cachedLayoutValueWrapper=>{denormalizedRecordCreateDefaults.layout=cachedLayoutValueWrapper.value;}));return Thenable.all(thenables).then(()=>{// The denormalized recordCreateDefaults should now be ready to go.
    return denormalizedRecordCreateDefaults;}).catch(rejectionReason=>{const errMsg=`_denormalizedRecordCreateDefaults() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    {// tslint:disable-next-line:no-console
    console.log(errMsg);}});}/**
         * Normalize record create defaults value.
         * @param denormalizedRecordCreateDefaults RecordCreateDefaults denormalized value
         * @param cacheAccessor An object to access cache directly.
         * @param recordCreateDefaultsCacheKey The cache key for RecordCreateDefaults.
         * @returns A Thenable that resolves to the normalized RecordCreateDefaults object.
         */_normalizeAndStagePutRecordCreateDefaults(denormalizedRecordCreateDefaults,cacheAccessor,recordCreateDefaultsCacheKey,dependentCacheKeys){const normalizedRecordCreateDefaults=clone(denormalizedRecordCreateDefaults,recordCreateDefaultsCacheKey);const stagePutThenables=[];// Object Info normalization
    const objectInfos=denormalizedRecordCreateDefaults.objectInfos;Object.keys(objectInfos).forEach(objectApiName=>{const objectInfo=objectInfos[objectApiName];// Construct the marker.
    normalizedRecordCreateDefaults.objectInfos[objectApiName]=new ObjectInfoCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setObjectApiName(objectInfo.apiName).setETag(objectInfo.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(OBJECT_INFO_VALUE_TYPE,[recordCreateDefaultsCacheKey],objectInfo,cacheAccessor));});// Layout normalization
    const layout=denormalizedRecordCreateDefaults.layout;const objectApiName2=denormalizedRecordCreateDefaults.record.apiName;// Construct the marker for layout. We need to keep the following data on the marker so that we have the necessary data
    // to recreate the layout cache key during denormalization and for checking for refresh during the affected key handler.
    const recordTypeId=recordServiceUtils.getRecordTypeIdFromRecord(denormalizedRecordCreateDefaults.record);normalizedRecordCreateDefaults.layout=new LayoutCacheValueMarkerBuilder().setRecordTypeId(recordTypeId).setObjectApiName(objectApiName2).setTimestamp(cacheAccessor.nowTime).setLayoutType(layout.layoutType).setMode(layout.mode).setETag(layout.eTag).build();stagePutThenables.push(this._ldsCache.stagePutValue(LAYOUT_VALUE_TYPE,[recordCreateDefaultsCacheKey],layout,cacheAccessor,{objectApiName:objectApiName2,recordTypeId}));return Thenable.all(stagePutThenables).then(()=>{// Stage put the record create defaults.
    // Strip out the eTag from the value. We don't want to emit eTags!
    const eTag=normalizedRecordCreateDefaults.eTag;delete normalizedRecordCreateDefaults.eTag;denormalizedRecordCreateDefaults=this.stripETagsFromValue(denormalizedRecordCreateDefaults);cacheAccessor.stagePut(dependentCacheKeys,recordCreateDefaultsCacheKey,normalizedRecordCreateDefaults,denormalizedRecordCreateDefaults,{eTag});return normalizedRecordCreateDefaults;}).catch(rejectionReason=>{const errMsg=`_normalizeAndStagePutRecordCreateDefaults() was not successful: ${rejectionReason}`;// TODO: Change back to logError when W-4421269 is fixed.
    // logError(errMsg);
    {// tslint:disable-next-line:no-console
    console.log(errMsg);throw errMsg;}});}}/**
     * Wire adapter id: getRecordCreateDefaults.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     * @returns void
     */function getRecordCreateDefaults(){throw generateError("getRecordCreateDefaults");}/**
     * Generates the wire adapters for:
     * @wire getRecordCreateDefaults
     */class RecordDefaultsWireAdapterGenerator{/*
         * Constructor.
         * @param recordDefaultsService Reference to the RecordDefaultsService instance.
         */constructor(recordDefaultsService){this._recordDefaultsService=recordDefaultsService;}/**
         * Generates the wire adapter for @wire getRecordCreateDefaults
         * @returns See description.
         */generateGetRecordCreateDefaultsWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetRecordCreateDefaults.bind(this));return wireAdapter;}/**
         * Service getRecordCreateDefaults @wire.
         * @private Made public for testing.
         * @param config Config params for the service. The type is or'd with any so that we can test sending bad configs. Consumers will be able to send us bad configs.
         * @return Observable stream that emits a recordCreateDefaults object.
         */_serviceGetRecordCreateDefaults(config){if(!config){return undefined;}{const required=["objectApiName"];const supported=["formFactor","objectApiName","optionalFields","recordTypeId"];validateConfig("getRecordCreateDefaults",config,required,supported);}if(!config.objectApiName){return undefined;}return this._recordDefaultsService.getRecordCreateDefaults(config.objectApiName,config.formFactor,config.recordTypeId,config.optionalFields);}}/**
     * Value type for Record Edit Actions
     */const RECORD_EDIT_ACTIONS_VALUES_VALUE_TYPE="lds.RecordEditActions";/**
     * Record Edit Actions expires in 5 seconds in the cache
     */const RECORD_EDIT_ACTIONS_TTL=5*60*1000;/**
     * Class to generate the LDS Cache Key for Record Edit Actions
     * @extends CacheKeyBuilder
     */class RecordEditActionsCacheKeyBuilder extends CacheKeyBuilder{/**
         * The default constructor
         */constructor(){super(RECORD_EDIT_ACTIONS_VALUES_VALUE_TYPE);}/**
         * Sets the record ids
         * @param recordIds
         * @return The builder for chaining
         */setRecordIds(recordIds){this.recordIds=recordIds;return this;}/**
         * Sets the form factor
         * @param formFactor
         * @return The builder for chaining
         */setFormFactor(formFactor){this.formFactor=formFactor;return this;}/**
         * Sets the sections
         * @param sections
         * @return The builder for chaining
         */setSections(sections){this.sections=sections;return this;}/**
         * Sets the action types
         * @param actionTypes
         * @return The builder for chaining
         */setActionTypes(actionTypes){this.actionTypes=actionTypes;return this;}/**
         * Builds a CacheKey for Record Edit Actions
         * @return A CacheKey for Record Edit Actions
         */build(){{assert$1(this.recordIds.length,"A non-empty recordIds must be provided");}const recordIds=stableCommaDelimitedString(this.recordIds);const formFactor=this.formFactor||"";const sections=stableCommaDelimitedString(this.sections);const actionTypes=stableCommaDelimitedString(this.actionTypes);const key=[recordIds,formFactor,sections,actionTypes].join(KEY_DELIM);return new CacheKey(this.getValueType(),key);}}/**
     * Retrieves parameters that were used to generate the provided affectedKey
     * @param affectedKey CacheKey from which the request parameters are retrieved
     * @return Request parameters for Record Edit Actions used to generate affectedKey
     */function reverseEngineer$1(affectedKey){const reverseJoin=str=>str?str.split(","):[];const components=affectedKey.getKey().split(KEY_DELIM);return {recordId:reverseJoin(components[1]),formFactor:components[2],sections:reverseJoin(components[3]),actionTypes:reverseJoin(components[4])};}/** The ui api endpoint of record edit actions
     */const ACTIONS_GLOBAL_CONTROLLER$1="ActionsController.getRecordEditActions";/**
     * Service to retrieve Record Edit Actions via UI API
     * @extends LdsServiceBase
     */class RecordEditActionsService extends LdsServiceBase{constructor(ldsCache,functionProvidesValueProviderFunction){super(ldsCache,[RECORD_EDIT_ACTIONS_VALUES_VALUE_TYPE]);/**
             * Implementation of affected key handler for this service
             */this.affectedKeyHandler=(affectedKey,cacheAccessor)=>{const parameters=reverseEngineer$1(affectedKey);return cacheAccessor.get(affectedKey).then(oldValueWrapper=>{if(oldValueWrapper){return denormalizePayload(cacheAccessor,affectedKey,this.getCacheKeyDependencyOfKey.bind(this,parameters)).then(updatedActionPayloadToEmit=>{const valueWrapper=ValueWrapper.cloneWithValueOverride(oldValueWrapper,updatedActionPayloadToEmit);cacheAccessor.stageEmit(affectedKey,valueWrapper);});}return Thenable.resolve();});};this._functionProvidesValueProviderFunction=functionProvidesValueProviderFunction;}getCacheValueTtl(){return RECORD_EDIT_ACTIONS_TTL;}/**
         * Checks if cache entry has a value
         * @param entry Cache Entry
         * @return True if cache entry has a value
         */doesCacheEntryHaveValue(entry){return !!entry&&entry.value!==undefined;}/**
         * Checks if cache entry has expired
         * @param now Current timestamp
         * @param entry
         * @return True if cache has expired
         */hasNotExpired(now,entry){return !isNaN(now)&&!isNaN(entry.lastFetchTime)&&now-entry.lastFetchTime<RECORD_EDIT_ACTIONS_TTL;}/**
         * A higher order function to return an affected key handler
         */getAffectedKeyHandler(){return this.affectedKeyHandler;}/**
         * Retrieves Record Edit Actions through either a Cache hit or a fresh API call
         * @param recordIds records with the action
         * @param requestParams options to filter the resulting actions by form factor, section, or action type
         * @returns collection of actions grouped by associated object api name
         */getRecordEditActions(recordIds,requestParams){const parameters=Object.assign({},{recordId:recordIds},requestParams);const cacheKey=this.buildCacheKey(parameters);const valueProviderFunction=this._functionProvidesValueProviderFunction?this._functionProvidesValueProviderFunction(cacheKey,parameters,false):this.getValueProviderFn(cacheKey,parameters,false);return this._ldsCache.get(cacheKey,new ValueProvider(valueProviderFunction,{}));}/**
         * Stage puts the given action.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param action The action to stagePut.
         * @param cacheAccessor An object to access cache directly.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,action,cacheAccessor,additionalData){const recordActionCacheKey=this.buildCacheKey(additionalData);cacheAccessor.stagePut(dependentCacheKeys,recordActionCacheKey,action,action);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given action by directly deleting them.
         * @param action The action from which to strip the eTags.
         * @returns The given action with its eTags stripped.
         */stripETagsFromValue(action){delete action.eTag;return action;}/**
         * Generates a function for constructing a value provider
         * @param cacheKey Key associated with parameters
         * @param params Required for retrieving data from source
         * @param forceFetch Indicates whether a server round trip is forced
         * @returns value provider function for status of cache query: CACHE_MISS/CACHE_HIT/CACHE_MISS_REFRESH_UNCHANGED
         */getValueProviderFn(cacheKey,params,forceFetch){return cacheAccessor=>{return cacheAccessor.get(cacheKey).then(cacheEntry=>{if(!forceFetch&&this.doesCacheEntryHaveValue(cacheEntry)&&this.hasNotExpired(cacheAccessor.nowTime,cacheEntry)){return Thenable.resolve(ValueProviderResult.CACHE_HIT);}return this.primeCacheEntries(params,cacheAccessor,cacheKey).then(result=>{if(cacheEntry&&cacheEntry.eTag&&result.eTag&&cacheEntry.eTag===result.eTag){return ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED;}else{return ValueProviderResult.CACHE_MISS;}});});};}/**
         * Fetches data from server, primes cache entry, and performs related housekeeping
         * @param parameters Required for retrieval of data from server
         * @param cacheAccessor Accessor to underlying data for the transaction
         * @param cacheKey Key associated with request
         * @returns A raw payload from the server
         */primeCacheEntries(parameters,cacheAccessor,cacheKey){return executeAuraGlobalController(ACTIONS_GLOBAL_CONTROLLER$1,parameters).then(response=>{return response.body;}).then(result=>{normalizePayload(cacheAccessor,this.getCacheKeyDependencyOfKey.bind(this,parameters),cacheKey,result);return cacheAccessor.commitPuts().then(affectedKeys=>Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor))).then(()=>result);});}/**
         * Builds cache key from Record Edit request parameters
         * @param parameters Record edit action parameters
         * @return A cache key for the Record Edit actions
         */buildCacheKey(parameters){const{recordId,formFactor,actionTypes,sections}=parameters;return new RecordEditActionsCacheKeyBuilder().setRecordIds(recordId).setFormFactor(formFactor).setActionTypes(actionTypes).setSections(sections).build();}/**
         *  Returns a CacheKeyDependencies object which links the action's cache key with the cache keys of its dependencies.
         * @param requestParameters
         * @param recordId
         * @return Cache key along with its dependencies
         */getCacheKeyDependencyOfKey({formFactor,sections,actionTypes},recordId){const cacheKey=new RecordEditActionsCacheKeyBuilder().setRecordIds([recordId]).setFormFactor(formFactor).setSections(sections).setActionTypes(actionTypes).build();return {cacheKey,dependencies:[]};}}/**
     * Wire adapter id: getRecordEditValues.
     * @throws Always throws an error when invoked. Imperative invocation is not supported.
     */function getRecordEditActions(){throw generateError("getRecordEditActionValues");}/**
     * Generates the wire adapter for Record Edit Actions.
     * */class RecordEditActionsWireAdapterGenerator{constructor(recordEditActionsService){this._recordEditActionsService=recordEditActionsService;}/**
         * Generates the wire adapter for getRecordEditActions.
         * @return See description.
         * */generateGetRecordEditActionsWireAdapter(){return generateWireAdapter(this.serviceGetRecordEditActions.bind(this));}/**
         * Service getRecordEditActions @wire.
         * @param recordIds Records containing action
         * @param config Optional parameters like formFactor to further filter results by
         * @return Observable stream that emits record edit actions.
         * */serviceGetRecordEditActions(recordIds,config){return this._recordEditActionsService.getRecordEditActions(recordIds,config);}}/**
     * The valueType to use when building RecordFormSectionCacheKeys.
     */const RECORD_FORM_SECTION_VALUE_TYPE="lds.ModuleRecordFormSection";/**
     * The valueType to use when building FormSectionDynamicComponent.
     */const FORM_SECTION_DYNAMIC_COMPONENT_VALUE_TYPE="lds.FormSectionDynamicComponent";/**
     * Time to live for the Form cache value. 30 days.
     */const RECORD_FORM_SECTION_VALUES_TTL=2592000000;/**
     * The master record type id.
     */const MASTER_RECORD_TYPE_ID$1="012000000000000AAA";/**
     * Cache value marker for record form.
     */class RecordFormCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param formName The form name for the marker.
         * @param formSection The form section for the marker.
         * @param objectApiName The objectApiName for the marker.
         * @param recordTypeId The recordTypeId for the marker.
         * @param dynamicComponentType The dynamicComponentType for the marker.
         * @param mode The mode for the marker.
         * @param eTag The eTag for the marker.
         */constructor(timestamp,formName,formSection,objectApiName,recordTypeId,dynamicComponentType,mode,eTag){super(timestamp);this.formName=formName;this.formSection=formSection;this.objectApiName=objectApiName;this.recordTypeId=recordTypeId;this.dynamicComponentType=dynamicComponentType;this.mode=mode;this.eTag=eTag;}}/**
     * Constructs a RecordFormCacheValueMarker.
     */class RecordFormCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the formName for the marker.
         * @param formName The form name.
         * @returns The current object. Useful for chaining method calls.
         */setFormName(formName){this._formName=formName;return this;}/**
         * Sets the formSection for the marker.
         * @param formSection The form name.
         * @returns The current object. Useful for chaining method calls.
         */setFormSection(formSection){this._formSection=formSection;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * Sets the dynamicComponentType for the marker.
         * @param dynamicComponentType The dynamicComponentType.
         * @returns The current object. Useful for chaining method calls.
         */setDynamicComponentType(dynamicComponentType){this._dynamicComponentType=dynamicComponentType;return this;}/**
         * Sets the mode for the marker.
         * @param mode The mode.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode;return this;}/**
         * Sets the eTag for the marker.
         * @param eTag
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Builds the RecordLayoutCacheValueMarker with the assigned parameters.
         * @returns A new RecordLayoutCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._mode,"A non-empty mode must be set.");}return new RecordFormCacheValueMarker(this._timestamp,this._formName,this._formSection,this._objectApiName,this._recordTypeId,this._dynamicComponentType,this._mode,this._eTag);}}class RecordFormSectionCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(RECORD_FORM_SECTION_VALUE_TYPE);}/**
         * Sets the recordId for the cache key.
         * @param recordId The record id with which the form is associated.
         * @returns The current object. Useful for chaining method calls.
         */setRecordId(recordId){this.recordId=recordId;return this;}/**
         * Gets the recordId for the cache key.
         */getRecordId(){return this.recordId;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the form is associated.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this.mode=mode;return this;}/**
         * Gets the mode for the cache key.
         */getMode(){return this.mode;}/**
         * Sets the formName for the cache key.
         * @param formName The form name with which the form is associated.
         * @returns The current object. Useful for chaining method calls.
         */setFormName(formName){this.formName=formName;return this;}/**
         * Gets the formName for the cache key.
         */getFormName(){return this.formName;}/**
         * Sets the section name for the cache key.
         * @param formSection The section name with which the form is associated.
         * @returns The current object. Useful for chaining method calls.
         */setFormSection(formSection){this.formSection=formSection;return this;}/**
         * Gets the section name for the cache key
         */getFormSection(){return this.formSection;}/**
         * Builds the cache key.
         * @returns A new cache key representing the record form section value type.
         */build(){{assert$1(this.recordId,"A non-empty recordId must be provided.");assert$1(this.formName,"A non-empty formName must be provided.");assert$1(this.formSection,"A non-empty sectionName must be provided.");assert$1(this.mode,"A non-empty mode must be provided.");}return new CacheKey(this.getValueType(),`${this.recordId}${KEY_DELIM}${this.formName}${KEY_DELIM}${this.formSection}${KEY_DELIM}${this.mode}`);}/**
         * Returns a RecordFormSectionCacheKeyBuilder based on a cacheKey.
         * @param cacheKey The cacheKey object for form.
         * @returns The cache key builder based on a cacheKey.
         */static fromCacheKey(cacheKey){const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);{assert$1(localKeyParts.length===4,`localKeyParts did not have the required parts(recordId, formName, sectionName and mode): ${localKeyParts}`);assert$1(cacheKey.getValueType()===RECORD_FORM_SECTION_VALUE_TYPE,`valueType was expected to be RECORD_FORM_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const builder=new RecordFormSectionCacheKeyBuilder();builder.setRecordId(localKeyParts[0]);builder.setFormName(localKeyParts[1]);builder.setFormSection(localKeyParts[2]);builder.setMode(localKeyParts[3]);return builder;}}class FormSectionDynamicComponentCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(FORM_SECTION_DYNAMIC_COMPONENT_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name with which the form descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName;return this;}/**
         * Gets the objectApiName for the cache key.
         */getObjectApiName(){return this.objectApiName;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId: The record type id with which the form descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this.recordTypeId=recordTypeId;return this;}/**
         * Gets the recordTypeId for the cache key.
         */getRecordTypeId(){return this.recordTypeId;}/**
         * Sets the formName for the cache key.
         * @param formName The form name with which the form descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setFormName(formName){this.formName=formName;return this;}/**
         * Gets the formName for the cache key.
         */getFormName(){return this.formName;}/**
         * Sets the section name for the cache key.
         * @param formSection The section name with which the form descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setFormSection(formSection){this.formSection=formSection;return this;}/**
         * Gets the section name for the cache key
         */getFormSection(){return this.formSection;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this.mode=mode;return this;}/**
         * Gets the current mode for the cache key.
         */getMode(){return this.mode;}/**
         * Builds the cache key.
         * @returns A new cache key representing the descriptor record layout value type.
         */build(){{assert$1(this.objectApiName,"A non-empty objectApiName must be provided.");assert$1(this.recordTypeId!==null&&this.recordTypeId!==undefined,"recordTypeId must be defined.");assert$1(this.formName,"A non-empty formName must be provided.");assert$1(this.formSection,"A non-empty sectionName must be provided.");assert$1(this.mode,"A non-empty mode must be provided.");}return new CacheKey(this.getValueType(),`${this.objectApiName}${KEY_DELIM}${this.recordTypeId}${KEY_DELIM}${this.formName}${KEY_DELIM}${this.formSection}${KEY_DELIM}${this.mode}`);}/**
         * Returns a DescriptorFormCacheKeyBuilder based on a cacheKey. Throws an error if it can't be done because a bad string is provided.
         * @param cacheKey The cacheKey object for form.
         * @returns A DescriptorFormCacheKeyBuilder based on a cacheKey.
         */static fromCacheKey(cacheKey){const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);{assert$1(localKeyParts.length===5,`localKeyParts did not have the required parts(objectApiName, recordTypeId, formName, sectionName and mode): ${localKeyParts}`);assert$1(cacheKey.getValueType()===FORM_SECTION_DYNAMIC_COMPONENT_VALUE_TYPE,`valueType was expected to be DESCRIPTOR_FORM_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const builder=new FormSectionDynamicComponentCacheKeyBuilder();builder.setObjectApiName(localKeyParts[0]);builder.setRecordTypeId(localKeyParts[1]);builder.setFormName(localKeyParts[2]);builder.setFormSection(localKeyParts[3]);builder.setMode(localKeyParts[4]);return builder;}}/*
     * TODO: This class needs to be separated out into multiple service classes so there is a one to one mapping
     * of VALUE_TYPE to service class.
     * Provides functionality to fetch form's dynamic component from the cache. Can refresh the data from the server.
     */class RecordFormService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param adsBridge Reference to the AdsBridge instance.
         */constructor(ldsCache,adsBridge){super(ldsCache,[FORM_SECTION_DYNAMIC_COMPONENT_VALUE_TYPE,RECORD_FORM_SECTION_VALUE_TYPE]);this._adsBridge=adsBridge;// TODO: When this service gets split out, the new service that handles the RECORD_FORM_SECTION_VALUE_TYPE
    // should use the getAffectedKeyHandler LdsService function to return the hander function instead
    // of registering it like this.
    this._ldsCache.registerAffectedKeyHandler(RECORD_FORM_SECTION_VALUE_TYPE,this._affectedKeyHandler.bind(this));}getCacheValueTtl(){return RECORD_FORM_SECTION_VALUES_TTL;}/**
         * Get a form section's dynamic component.
         * @param recordId The record id for which the form's dynamic component is being requested.
         * @param formName The form name for which the the form's dynamic component is being requested.
         * @param formSection formSection The section name for which the the form's dynamic component is being requested.
         * @param mode The mode for which the the form's dynamic component is being requested.
         * @returns An observable that emits the form's dynamic component.
         */getFormSectionComponent(recordId,formName,formSection,mode){const recordFormSectionCacheKey=new RecordFormSectionCacheKeyBuilder().setRecordId(recordId).setFormName(formName).setFormSection(formSection).setMode(mode).build();const valueProviderParameters={recordFormSectionCacheKey,recordId,formName,formSection,mode,forceProvide:false,recordTypeChanged:false};const observable=this._ldsCache.get(recordFormSectionCacheKey,this._createFormSectionDynamicComponentValueProvider(valueProviderParameters));return observable;}/**
         * Stage puts the given dynamicComponent value.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param dynamicComponent The dynamicComponent to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,dynamicComponent,cacheAccessor,additionalData){const formSectionDynamicComponentCacheKey=new FormSectionDynamicComponentCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).setFormName(additionalData.formName).setFormSection(additionalData.formSection).setMode(additionalData.mode).build();const recordFormSectionCacheKey=new RecordFormSectionCacheKeyBuilder().setRecordId(additionalData.recordId).setFormName(additionalData.formName).setFormSection(additionalData.formSection).setMode(additionalData.mode).build();this._normalizeAndStagePutDynamicComponent(cacheAccessor,additionalData.recordId,formSectionDynamicComponentCacheKey,recordFormSectionCacheKey,dynamicComponent);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given dynamicComponent by directly deleting them.
         * @param dynamicComponent The dynamicComponent from which to strip the eTags.
         * @returns The given dynamicComponent with its eTags stripped.
         */stripETagsFromValue(dynamicComponent){return dynamicComponent;}/**
         * Constructs a value provider to retrieve a form section dynamic component.
         * @param valueProviderParameters See RecordFormSectionValueProviderParameters description.
         * @returns The value provider to retrieve the form's dynamic component.
         */_createFormSectionDynamicComponentValueProvider(valueProviderParameters){const{// Do NOT set defaults here. See W-4840393.
    recordFormSectionCacheKey,recordId,formName,formSection,mode,forceProvide,recordTypeChanged}=valueProviderParameters;const formSectionDynamicComponentValueProvider=new ValueProvider(cacheAccessor=>{const cacheAccessorWrapped=recordServiceUtils.wrapCacheAccessor(cacheAccessor,this._adsBridge);const apiCallFn=(dynamicComponent,formSectionDynamicComponentCacheKey)=>{let formSectionDynamicComponentThenable;// If the dynamicComponent is provided, we don't go to server to fetch it.
    if(dynamicComponent){formSectionDynamicComponentThenable=ThenableFactory.resolve(dynamicComponent);}else{const params={components:[{type:"FormSectionDetailPanel",attributes:{recordId,formName,formSection,mode}}]};formSectionDynamicComponentThenable=executeAuraGlobalController("DynamicComponentController.generateComponentsAndFetchData",params).then(results=>{// only return the first result since we only requested a single result
    return results?results.body[0]:undefined;});}return formSectionDynamicComponentThenable.then(freshValue=>{if(!dynamicComponent){// we do not have a dynamic component, so we should have formUi and recordAvatars.
    {assert$1(freshValue.aggregateUi,`aggregateUi was not found: $freshValue.aggregateUi`);assert$1(freshValue.recordAvatars,`recordAvatars was not found: $freshValue.recordAvatars`);}const record=freshValue.aggregateUi.records[recordId];// Normalize and stage put the formUi.
    // Pass in rootRecordMerge as true since we didn't request the aggregateUi with all tracked fields for applicable records.
    const formUiRepresentation=transformAggregateUiRepresentationIntoFormUiRepresentation(freshValue.aggregateUi);this._ldsCache.stagePutValue(FORM_UI_VALUE_TYPE,[],formUiRepresentation,cacheAccessorWrapped,{rootRecordMerge:true});// stage put the record avatars
    this._ldsCache.stagePutValue(RECORD_AVATAR_BULK_VALUE_TYPE,[],freshValue.recordAvatars,cacheAccessorWrapped);// build the the form's dynamic component cache key
    formSectionDynamicComponentCacheKey=this._buildFormSectionDynamicComponentCacheKey(record,formName,formSection,mode);dynamicComponent=freshValue.dynamicComponent;// normalize and stage put the dynamic component
    return this._normalizeAndStagePutDynamicComponent(cacheAccessorWrapped,recordId,formSectionDynamicComponentCacheKey,recordFormSectionCacheKey,dynamicComponent);}if(formSectionDynamicComponentCacheKey){{assert$1(formSectionDynamicComponentCacheKey.getValueType()===FORM_SECTION_DYNAMIC_COMPONENT_VALUE_TYPE,`Unexpected value type for form: ${formSectionDynamicComponentCacheKey.getValueType().toString()}`);}// update dependency and stage put only the form's dynamic component
    return this._stageDependencyNormalizeAndStagePutFormSection(cacheAccessorWrapped,recordId,formSectionDynamicComponentCacheKey,recordFormSectionCacheKey,dynamicComponent);}}).then(()=>{return cacheAccessorWrapped.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessorWrapped));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});};const lookForFormSectionDynamicComponentInCache=()=>{// check if there exists a record in cache
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return cacheAccessorWrapped.get(recordCacheKey).then(existingRecordValue=>{if(existingRecordValue&&existingRecordValue.value!==undefined){const record=existingRecordValue.value;// build the form dynamic component cache key
    const formSectionDynamicComponentCacheKey=this._buildFormSectionDynamicComponentCacheKey(record,formName,formSection,mode);// check if the form dynamic component exists in the cache
    return cacheAccessorWrapped.get(formSectionDynamicComponentCacheKey).then(existingFormSectionDynamicComponent=>{if(existingFormSectionDynamicComponent&&existingFormSectionDynamicComponent.value!==undefined){const formSectionNowTime=cacheAccessorWrapped.nowTime;const formSectionLastFetchTime=existingFormSectionDynamicComponent.lastFetchTime;// check for ttl expiry of the form's dynamic component
    const formSectionDynamicComponentNeedsRefresh=formSectionNowTime>formSectionLastFetchTime+RECORD_FORM_SECTION_VALUES_TTL;if(formSectionDynamicComponentNeedsRefresh){// if form dynamic component is present in cache and ttl of form dynamic component has expired, then fetch everything from DynamicComponentController
    return apiCallFn();}// if form dynamic component is present in cache and ttl has not expired, then stagePut the dynamic component and return CACHE_MISS
    return apiCallFn(existingFormSectionDynamicComponent.value,formSectionDynamicComponentCacheKey);}// if form dynamic component is not present in cache then fetch everything from DynamicComponentController
    return apiCallFn();});}// if record is not present in cache then fetch everything from DynamicComponentController
    return apiCallFn();});};// if recordType has changed, then look for form dynamic component with new recordType in cache, and if the form dynamic component with new recordType is not present in cache,
    // we fetch everything from DynamicComponentController
    if(recordTypeChanged){return lookForFormSectionDynamicComponentInCache();}if(forceProvide){return apiCallFn();}return cacheAccessorWrapped.get(recordFormSectionCacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessorWrapped.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+RECORD_FORM_SECTION_VALUES_TTL;if(needsRefresh){// Trigger a refresh. We don't care about the return value of this, we just need to force an API call
    // to keep the Observable's data stream alive.
    return apiCallFn();}return ValueProviderResult.CACHE_HIT;}// look for form's dynamic component in cache, and it the form's dynamic component is not present in cache,
    // we fetch everything from DynamicComponentController
    return lookForFormSectionDynamicComponentInCache();});},valueProviderParameters);return formSectionDynamicComponentValueProvider;}/**
         * Normalize the form dynamic component and create dependency for record section form on the form dynamic component and the record.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record form depends.
         * @param formSectionDynamicComponentCacheKey Cache key for form's dynamic component.
         * @param recordFormSectionCacheKey Cache key for record form.
         * @param denormalizedDynamicComponent The form's dynamic component that needs to be normalized.
         */_normalizeAndStagePutDynamicComponent(cacheAccessor,recordId,formSectionDynamicComponentCacheKey,recordFormSectionCacheKey,denormalizedDynamicComponent){// stage the dependency for record form section cache key on the record cache key so that if recordTypeId changes, then we get notified and we can handle the changes appropriately
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();cacheAccessor.stageDependencies([recordFormSectionCacheKey],recordCacheKey);// the form dynamic component is not based on recordId. it's based on objectApiName, formName, formSection, mode and recordTypeId
    // if we store the recordId as well, then there is chance of returning a wrong recordId within the dynamicComponent in the case of CACHE_HIT
    // thereby delete the recordId on the dynamicComponent before stagePut
    delete denormalizedDynamicComponent.recordId;cacheAccessor.stagePut([recordFormSectionCacheKey],formSectionDynamicComponentCacheKey,denormalizedDynamicComponent,denormalizedDynamicComponent);const keyBuilder=RecordFormSectionCacheKeyBuilder.fromCacheKey(recordFormSectionCacheKey);const normalizedDynamicComponent=new RecordFormCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setFormName(denormalizedDynamicComponent.formName).setFormSection(denormalizedDynamicComponent.formSection).setObjectApiName(denormalizedDynamicComponent.objectApiName).setRecordTypeId(denormalizedDynamicComponent.recordTypeId).setDynamicComponentType(denormalizedDynamicComponent.dynamicComponentType).setMode(keyBuilder.getMode()).build();return cacheAccessor.stagePut([],recordFormSectionCacheKey,normalizedDynamicComponent,denormalizedDynamicComponent);}/**
         * Stage put record form section and stage dependencies on the already existing form dynamic component and record that exists in cache.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record form depends.
         * @param formSectionDynamicComponentCacheKey Cache key for form's dynamic component.
         * @param recordFormSectionCacheKey Cache key for record form.
         * @param denormalizedDynamicComponent The form's dynamic component that needs to be normalized.
         */_stageDependencyNormalizeAndStagePutFormSection(cacheAccessor,recordId,formSectionDynamicComponentCacheKey,recordFormSectionCacheKey,denormalizedDynamicComponent){// stage the dependency for record form cache key on the record cache key so that if recordTypeId changes, then we get notified and we can handle the changes appropriately
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();cacheAccessor.stageDependencies([recordFormSectionCacheKey],recordCacheKey);// stage dependency for record form cache key on the form dynamic component
    cacheAccessor.stageDependencies([recordFormSectionCacheKey],formSectionDynamicComponentCacheKey);// normalize and stage put the form's dynamic component
    const keyBuilder=RecordFormSectionCacheKeyBuilder.fromCacheKey(recordFormSectionCacheKey);const normalizedDynamicComponent=new RecordFormCacheValueMarkerBuilder().setTimestamp(cacheAccessor.nowTime).setFormName(denormalizedDynamicComponent.formName).setFormSection(denormalizedDynamicComponent.formSection).setObjectApiName(denormalizedDynamicComponent.objectApiName).setRecordTypeId(denormalizedDynamicComponent.recordTypeId).setDynamicComponentType(denormalizedDynamicComponent.dynamicComponentType).setMode(keyBuilder.getMode()).build();return cacheAccessor.stagePut([],recordFormSectionCacheKey,normalizedDynamicComponent,denormalizedDynamicComponent);}/**
         * Takes the normalized record form section dynamic component and cacheAccessor and returns the denormalized record form section dynamic component.
         * @param normalizedRecordFormSectionDynamicComponent The record form to be denormalized. This should always be a normalized record form that came from the cache.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param recordFormSectionCacheKey Cache key for the record form.
         * @returns See description.
         */_denormalizeRecordFormSectionDynamicComponent(normalizedRecordFormSectionDynamicComponent,cacheAccessor,recordFormSectionCacheKey){{assert$1(recordFormSectionCacheKey.getValueType()!==undefined,`Value type for RecordForm was undefined.`);assert$1(recordFormSectionCacheKey.getValueType()===RECORD_FORM_SECTION_VALUE_TYPE,`Expected RECORD_FORM_VALUE_TYPE value type for RecordForm: ${recordFormSectionCacheKey.getValueType().toString()}`);assert$1(cacheValueMarkerUtils.isMarker(normalizedRecordFormSectionDynamicComponent),`Did not find record form marker property`);}let denormalizedRecordFormSectionDynamicComponent=null;// build the form's dynamic component cache key object
    const formSectionDynamicComponentCacheKey=new FormSectionDynamicComponentCacheKeyBuilder().setObjectApiName(normalizedRecordFormSectionDynamicComponent.objectApiName).setRecordTypeId(normalizedRecordFormSectionDynamicComponent.recordTypeId).setFormName(normalizedRecordFormSectionDynamicComponent.formName).setFormSection(normalizedRecordFormSectionDynamicComponent.formSection).setMode(normalizedRecordFormSectionDynamicComponent.mode).build();cacheAccessor.get(formSectionDynamicComponentCacheKey).then(formSectionDynamicComponentValueWrapper=>{denormalizedRecordFormSectionDynamicComponent=clone(formSectionDynamicComponentValueWrapper.value,formSectionDynamicComponentCacheKey);});return denormalizedRecordFormSectionDynamicComponent;}/**
         * Helper method to build the form's dynamic component cache key.
         * @param record The record used to fetch the recordTypeId to construct the form's dynamic component cache key.
         * @param formName The form name used to construct the form's dynamic component cache key.
         * @param sectionName The section name used to construct the form's dynamic component cache key.
         * @param mode The mode used to construct the form's dynamic component cache key.
         * @returns The form's dynamic component cache key.
         */_buildFormSectionDynamicComponentCacheKey(record,formName,formSection,mode){const recordTypeId=record.recordTypeInfo?record.recordTypeInfo.recordTypeId:MASTER_RECORD_TYPE_ID$1;const formSectionDynamicComponentCacheKey=new FormSectionDynamicComponentCacheKeyBuilder().setObjectApiName(record.apiName).setRecordTypeId(recordTypeId).setFormName(formName).setFormSection(formSection).setMode(mode).build();return formSectionDynamicComponentCacheKey;}/**
         * Affected key handler for FormSectionDynamicComponent values. The cache will call this handler when a FormSectionDynamicComponent cache value
         * could have been affected by a change in another related cache key value.
         * @param affectedKey The cache key of the affected RecordFormSectionDynamicComponent cache value.
         * @param cacheAccessor The instace of the cache accessor that contains the current transaction.
         * @returns
         */_affectedKeyHandler(affectedKey,cacheAccessor){{assert$1(affectedKey.getValueType()===RECORD_FORM_SECTION_VALUE_TYPE,`Expected RECORD_FORM_SECTION_VALUE_TYPE value type for RecordForm: ${affectedKey.getValueType().toString()}`);}return cacheAccessor.get(affectedKey).then(normalizedRecordFormSectionValueWrapper=>{if(normalizedRecordFormSectionValueWrapper){const normalizedRecordFormSectionValue=normalizedRecordFormSectionValueWrapper.value;{assert$1(normalizedRecordFormSectionValueWrapper.value,`normalizedRecordFormValueWrapper.value was falsy: ${normalizedRecordFormSectionValueWrapper}`);}// fetch params from affected key
    const keyBuilder=RecordFormSectionCacheKeyBuilder.fromCacheKey(affectedKey);const recordFormSectionCacheKey=keyBuilder.build();const recordId=keyBuilder.getRecordId();const formName=keyBuilder.getFormName();const formSection=keyBuilder.getFormSection();const mode=keyBuilder.getMode();// figure out if the recordTypeId of the record has changed
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const refreshedRecordValueWrapper=cacheAccessor.getCommitted(recordCacheKey);const existingRecordTypeId=normalizedRecordFormSectionValue.recordTypeId;let recordTypeChanged=false;if(refreshedRecordValueWrapper){const refreshedRecord=refreshedRecordValueWrapper.value;{assert$1(refreshedRecord,`unexpected falsy value for refreshedRecord: ${refreshedRecord}`);}const newRecordTypeId=refreshedRecord.recordTypeInfo?refreshedRecord.recordTypeInfo.recordTypeId:MASTER_RECORD_TYPE_ID$1;if(newRecordTypeId!==existingRecordTypeId){recordTypeChanged=true;}}if(!recordTypeChanged){// if recordTypeId has not changed, there is no need to force refresh, denorm the value of form's dynamic component and emit
    const denormedDynamicComponent=this._denormalizeRecordFormSectionDynamicComponent(normalizedRecordFormSectionValue,cacheAccessor,affectedKey);if(denormedDynamicComponent&&denormedDynamicComponent.dynamicComponentDescriptor){const dynamicComponentValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(normalizedRecordFormSectionValueWrapper,denormedDynamicComponent);cacheAccessor.stageEmit(affectedKey,dynamicComponentValueWrapperToEmit);return undefined;}}// When recordTypeId has changed, we need to do figure out whether we need a full refresh of the recordFormCache.
    // or the form's dynamic component with updated recordType already exists in cache.
    // However we're already in a cache transaction.
    // Kick this to a Promise to get this out of the cache operation we're already in the middle of.
    // and then figure out if we have everything required in cache or we need to queue a fresh request
    return Promise.resolve().then(()=>{const forceProvide=false;// For now set it to false, if we cannot find the updated form's dynamic component in cache, we will make it forceProvide
    recordTypeChanged=true;// we know that record type has changed, so ignore the force provide until we cannot find the updated form's dynamic component in cache
    const vpArgs={recordFormSectionCacheKey,recordId,formName,formSection,mode,forceProvide,recordTypeChanged};this._ldsCache.get(affectedKey,this._createFormSectionDynamicComponentValueProvider(vpArgs));return undefined;});}else if(this._ldsCache.getObservables(affectedKey)){// There is an observable for this affectedKey but we couldn't find its value in the cache.
    // TODO W-4485745: If we can't denormalize the record form section, we should do the following:
    // - Don't emit yet.
    // - Refresh the value from server.
    {assert$1(false,`Need to denorm/emit a RecordFormSection we no longer have in cache: ${affectedKey.getKey()}`);}}return undefined;});}}/**
     * The valueType to use when building RecordLayoutCacheKeys.
     */const RECORD_LAYOUT_VALUE_TYPE="lds.ModuleRecordLayout";/**
     * The valueType to use when building DescriptorRecordLayout.
     */const DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE="lds.DescriptorRecordLayout";/**
     * Time to live for the RecordLayout cache value. 30 days.
     */const RECORD_LAYOUT_VALUES_TTL=2592000000;/**
     * The master record type id.
     */const MASTER_RECORD_TYPE_ID$2="012000000000000AAA";/**
     * Constructs a cache key for the record layout value type. Keys are constructed from:
     * - recordId
     * - layoutType
     * - mode
     * - dynamicComponentType
     */class RecordLayoutCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(RECORD_LAYOUT_VALUE_TYPE);}/**
         * Sets the recordId for the cache key.
         * @param recordId The record id with which the record layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setRecordId(recordId){this._recordId=recordId;return this;}/**
         * Gets the recordId for the cache key.
         */getRecordId(){return this._recordId;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the record layout is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode.toLowerCase();return this;}/**
         * Gets the mode for the cache key.
         */getMode(){return this._mode;}/**
         * Sets the layoutType for the cache key.
         * @param layoutType The layout type with which the record layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this._layoutType=layoutType.toLowerCase();return this;}/**
         * Gets the layoutType for the cache key.
         */getLayoutType(){return this._layoutType;}/**
         * Sets the dynamicComponentType for the cache key.
         * @param dynamicComponentType The dynamic component type with which the record layout is associated.
         * @returns The current object. Useful for chaining method calls.
         */setDynamicComponentType(dynamicComponentType){this._dynamicComponentType=dynamicComponentType;return this;}/**
         * Gets the layoutType for the cache key.
         */getDynamicComponentType(){return this._dynamicComponentType;}/**
         * Builds the cache key.
         * @returns A new cache key representing the record layout value type.
         */build(){{assert$1(this._recordId,"A recordId must be provided to build a RecordLayoutCacheKey");assert$1(this._layoutType,"A non-empty layoutType must be provided.");assert$1(this._mode,"A non-empty mode must be provided.");assert$1(this._dynamicComponentType,"A non-empty dynamic component type must be provided.");assert$1(this._recordId.length===18,"Record Id length should be 18 characters.");}return new CacheKey(this.getValueType(),`${this._recordId}${KEY_DELIM}${this._layoutType}${KEY_DELIM}${this._mode}${KEY_DELIM}${this._dynamicComponentType}`);}/**
         * Returns a RecordLayoutCacheKeyBuilder based on a cacheKey. Throws an error if it can't be done because a bad string is provided.
         * @param cacheKey The cacheKey object for layout
         * @returns A RecordLayoutCacheKeyBuilder based on a cacheKey.
         */static fromCacheKey(cacheKey){const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);{assert$1(localKeyParts.length===4,`localKeyParts did not have the required parts(recordId, layoutType, mode and dynamicComponentType): ${localKeyParts}`);assert$1(cacheKey.getValueType()===RECORD_LAYOUT_VALUE_TYPE,`valueType was expected to be RECORD_LAYOUT_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);}const builder=new RecordLayoutCacheKeyBuilder();builder.setRecordId(localKeyParts[0]);builder.setLayoutType(localKeyParts[1]);builder.setMode(localKeyParts[2]);builder.setDynamicComponentType(localKeyParts[3]);return builder;}}/**
     * Constructs a cache key for the layout descriptor value type. Keys are constructed from:
     * - objectApiName
     * - recordTypeId
     * - mode
     * - layoutType
     * - dynamicComponentType
     */class DescriptorLayoutCacheKeyBuilder extends CacheKeyBuilder{constructor(){super(DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName.toLowerCase();return this;}/**
         * Gets the objectApiName for the cache key.
         */getObjectApiName(){return this._objectApiName;}/**
         * Sets the recordTypeId for the cache key.
         * @param recordTypeId The record type id with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * Gets the recordTypeId for the cache key.
         */getRecordTypeId(){return this._recordTypeId;}/**
         * Sets the layoutType for the cache key.
         * @param layoutType The layout type with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this._layoutType=layoutType.toLowerCase();return this;}/**
         * Gets the layoutType for the cache key.
         */getLayoutType(){return this._layoutType;}/**
         * Sets the mode for the cache key.
         * @param mode The mode with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode.toLowerCase();return this;}/**
         * Gets the mode for the cache key.
         */getMode(){return this._mode;}/**
         * Sets the dynamicComponentType for the cache key.
         * @param dynamicComponentType The dynamicComponentType with which the layout descriptor is associated.
         * @returns The current object. Useful for chaining method calls.
         */setDynamicComponentType(dynamicComponentType){this._dynamicComponentType=dynamicComponentType;return this;}/**
         * Gets the dynamicComponentType for the cache key.
         */getDynamicComponentType(){return this._dynamicComponentType;}/**
         * Builds the cache key.
         * @returns A new cache key representing the descriptor record layout value type.
         */build(){{assert$1(this._objectApiName,"A non-empty objectApiName must be provided.");assert$1(this._recordTypeId!==null&&this._recordTypeId!==undefined,"recordTypeId must be defined.");assert$1(this._layoutType,"A non-empty layoutType must be provided.");assert$1(this._mode,"A non-empty mode must be provided.");assert$1(this._dynamicComponentType,"A non-empty dynamic component type must be provided.");}return new CacheKey(this.getValueType(),`${this._objectApiName}${KEY_DELIM}${this._recordTypeId}${KEY_DELIM}${this._layoutType}${KEY_DELIM}${this._mode}${KEY_DELIM}${this._dynamicComponentType}`);}/**
         * Returns a DescriptorLayoutCacheKeyBuilder based on a cacheKey. Throws an error if it can't be done because a bad string is provided.
         * @param cacheKey The cacheKey object for layout
         * @returns A DescriptorLayoutCacheKeyBuilder based on a cacheKey.
         */static fromCacheKey(cacheKey){const localKey=cacheKey.getLocalKey();const localKeyParts=localKey.split(KEY_DELIM);{assert$1(cacheKey.getValueType()===DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE,`valueType was expected to be DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE but was not: ${cacheKey.getValueType().toString()}`);assert$1(localKeyParts.length===5,`localKeyParts did not have the required parts(objectApiName, recordTypeId, layoutType, mode and dynamicComponentType): ${localKeyParts}`);}const builder=new DescriptorLayoutCacheKeyBuilder();builder.setObjectApiName(localKeyParts[0]);builder.setRecordTypeId(localKeyParts[1]);builder.setLayoutType(localKeyParts[2]);builder.setMode(localKeyParts[3]);builder.setDynamicComponentType(localKeyParts[4]);return builder;}}/**
     * Cache value marker for record layout.
     */class RecordLayoutCacheValueMarker extends CacheValueMarker{/**
         * Constructor.
         * @param timestamp The timestamp for the marker.
         * @param objectApiName The objectApiName for the marker.
         * @param recordTypeId The recordTypeId for the marker.
         * @param layoutType The layoutType for the marker.
         * @param mode The mode for the marker.
         * @param eTag The eTag for the marker.
         */constructor(timestamp,objectApiName,recordTypeId,layoutType,mode,dynamicComponentType,eTag){super(timestamp);this.objectApiName=objectApiName;this.recordTypeId=recordTypeId;this.layoutType=layoutType;this.mode=mode;this.dynamicComponentType=dynamicComponentType;this.eTag=eTag;}}/**
     * Constructs a RecordLayoutCacheValueMarker.
     */class RecordLayoutCacheValueMarkerBuilder extends CacheValueMarkerBuilder{/**
         * Sets the eTag for the marker.
         * @param eTag
         * @returns The current object. Useful for chaining method calls.
         */setETag(eTag){this._eTag=eTag;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this._objectApiName=objectApiName;return this;}/**
         * Sets the objectApiName for the marker.
         * @param objectApiName The objectApiName.
         * @returns The current object. Useful for chaining method calls.
         */setRecordTypeId(recordTypeId){this._recordTypeId=recordTypeId;return this;}/**
         * Sets the layoutType for the marker.
         * @param layoutType The layoutType.
         * @returns The current object. Useful for chaining method calls.
         */setLayoutType(layoutType){this._layoutType=layoutType;return this;}/**
         * Sets the mode for the marker.
         * @param mode The mode.
         * @returns The current object. Useful for chaining method calls.
         */setMode(mode){this._mode=mode;return this;}/**
         * Sets the dynamicComponentType for the marker.
         * @param dynamicComponentType The dynamicComponentType.
         * @returns The current object. Useful for chaining method calls.
         */setDynamicComponentType(dynamicComponentType){this._dynamicComponentType=dynamicComponentType;return this;}/**
         * Builds the RecordLayoutCacheValueMarker with the assigned parameters.
         * @returns A new RecordLayoutCacheValueMarker built with the assigned parameters.
         */build(){{assert$1(this._timestamp,"A non-empty timestamp must be set.");assert$1(this._layoutType,"A non-empty layoutType must be set.");assert$1(this._mode,"A non-empty mode must be set.");}return new RecordLayoutCacheValueMarker(this._timestamp,this._objectApiName,this._recordTypeId,this._layoutType,this._mode,this._dynamicComponentType,this._eTag);}}/**
     * Requests a template with expansion hints which may return more data that is needed as part of the template. The additional data
     * that is returned from the server is injected into the LDS caches. This method returns just the template to the caller.
     *
     * @param requestParams The parameters to pass to the server side
     * @param cacheAccessor Used to inject data into the lds caches
     * @param ldsCache Reference to the LdsCache instance
     * @param requestingServiceValueType the value type of the service requesting the template
     * @returns A promise of the template layout descriptor
     */function executeTemplateController(requestParams,cacheAccessor,ldsCache,requestingServiceValueType){// The controller returns a different response shape based on the RaptorFlexipagePerm:
    // Off: Uses the existing DynamicComponentController and its existing response type.
    // On: New response shape
    const requestUrl="DynamicComponentController.getTemplateDescriptorWithExpansion";// we can cast this as GenericTemplateRequestParams is a super set of the more specific types
    const genericRequestParams=requestParams;const params={type:genericRequestParams.type,attributes:Object.assign({},genericRequestParams.params,genericRequestParams.expansionHints)};return executeAuraGlobalController(requestUrl,params).then(transportResponse=>{const valueMap=transformResponse(transportResponse.body);// normalize and stage put the various pieces of information
    const stagePutThenables=[];const entries=Object.entries(valueMap);for(const[key,values]of entries){const valueType=ldsCache.getValueTypeForKey(key);if(valueType!==requestingServiceValueType){const _values=values;for(let i=0,l=_values.length;i<l;i++){const value=_values[i];stagePutThenables.push(ldsCache.stagePutValue(valueType,[],value.representation,cacheAccessor,value.additionalParams));}}}return Thenable.all(stagePutThenables).then(()=>{const templates=valueMap[requestingServiceValueType];// assumption that there is only one and the server doesn't send more back.
    // as the server code is extended we might need to extend this code
    const referenceMappedRepresentation=templates[0];if(genericRequestParams.type==="DetailPanel"||genericRequestParams.type==="HighlightsPanel"){const newResult={descriptor:referenceMappedRepresentation.representation,additionalParams:referenceMappedRepresentation.additionalParams};return newResult;}else if(genericRequestParams.type==="Flexipage"){const newResult={descriptor:referenceMappedRepresentation.representation,additionalParams:referenceMappedRepresentation.additionalParams};return newResult;}else{const newResult={descriptor:referenceMappedRepresentation.representation,additionalParams:referenceMappedRepresentation.additionalParams};return newResult;}});});}/**
     * This function transforms the old controllers data shape into the new one
     *
     * @param valueMap the new data shape
     * @return the emulated new data shape
     */function transformResponse(valueMap){// Mutate to save mem/cpu from copying
    if(valueMap.recordAvatars){const recordAvatars=valueMap.recordAvatars[0].representation;const avatarAdditionalData={recordAvatarIds:Object.keys(recordAvatars)};valueMap["uiapi.RecordAvatarBulk"]=[{representation:createRecordAvatarRepresentationsFromRecordAvatarBulk(recordAvatars),additionalParams:avatarAdditionalData}];delete valueMap.recordAvatars;}return valueMap;}/**
     * TODO: Split out this service into two (one for each value provider).
     * Provides functionality to fetch layout descriptor from the cache. Can refresh the data from the server.
     */class RecordLayoutService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param adsBridge Reference to the AdsBridge instance.
         */constructor(ldsCache,adsBridge){super(ldsCache,[DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE,RECORD_LAYOUT_VALUE_TYPE]);/**
             * Mapping of module observable cache key -> module observable.
             */this._moduleObservables=new Map();this._adsBridge=adsBridge;// TODO: When this service gets split out, the new service that handles the RECORD_LAYOUT_VALUE_TYPE
    // should use the getAffectedKeyHandler LdsService function to return the hander function instead
    // of registering it like this.
    this._ldsCache.registerAffectedKeyHandler(RECORD_LAYOUT_VALUE_TYPE,this._affectedKeyHandler.bind(this));}getCacheValueTtl(){return RECORD_LAYOUT_VALUES_TTL;}/**
         * Gets a layout template's descriptor.
         * @param recordId The record id for which the layout descriptor is being requested.
         * @param layoutType The layout type for which the layout descriptor is being requested.
         * @param mode The mode for which the layout descriptor is being requested.
         * @param dynamicComponentType The component for which this layout is loaded.
         * @returns An observable that emits the layout descriptor.
         */getLayoutTemplateDescriptor(recordId,layoutType,mode,dynamicComponentType){checkType(recordId,String);checkType(layoutType,String);checkType(mode,String);checkType(dynamicComponentType,String);recordId=to18(recordId);const recordLayoutCacheKey=new RecordLayoutCacheKeyBuilder().setRecordId(recordId).setLayoutType(layoutType).setMode(mode).setDynamicComponentType(dynamicComponentType).build();const valueProviderParameters={recordLayoutCacheKey,recordId,layoutType,mode,dynamicComponentType,forceProvide:false,recordTypeChanged:false};const observable=this._ldsCache.get(recordLayoutCacheKey,this._createLayoutTemplateDescriptorValueProvider(valueProviderParameters));return observable;}/**
         * Stage puts the given dynamicComponentDescriptor.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param dynamicComponentDescriptor The dynamicComponentDescriptor to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,dynamicComponentDescriptor,cacheAccessor,additionalData){const layoutDescriptorCacheKey=new DescriptorLayoutCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setRecordTypeId(additionalData.recordTypeId).setLayoutType(additionalData.layoutType).setMode(additionalData.mode).setDynamicComponentType(additionalData.dynamicComponentType).build();const recordLayoutCacheKey=new RecordLayoutCacheKeyBuilder().setRecordId(additionalData.recordId).setLayoutType(additionalData.layoutType).setMode(additionalData.mode).setDynamicComponentType(additionalData.dynamicComponentType).build();this._normalizeAndStagePutComponentDescriptor(cacheAccessor,additionalData.recordId,layoutDescriptorCacheKey,recordLayoutCacheKey,dynamicComponentDescriptor);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given dynamicComponentDescriptor by directly deleting them.
         * @param dynamicComponentDescriptor The dynamicComponentDescriptor from which to strip the eTags.
         * @returns The given dynamicComponentDescriptor with its eTags stripped.
         */stripETagsFromValue(dynamicComponentDescriptor){return dynamicComponentDescriptor;}/*
         * Gets a layout template as module.
         * @param recordId The record id for which the layout descriptor is being requested.
         * @param layoutType The layout type for which the layout descriptor is being requested.
         * @param mode The mode for which the layout descriptor is being requested.
         * @param dynamicComponentType The component for which this layout is loaded.
         * @returns An observable that emits the layout template module.
         */getLayoutTemplateModule(recordId,layoutType,mode,dynamicComponentType){checkType(recordId,String);checkType(layoutType,String);checkType(mode,String);checkType(dynamicComponentType,String);const recordLayoutCacheKey=new RecordLayoutCacheKeyBuilder().setRecordId(recordId).setLayoutType(layoutType).setMode(mode).setDynamicComponentType(dynamicComponentType).build();// prepare root observable
    this.getLayoutTemplateDescriptor(recordId,layoutType,mode,dynamicComponentType);const observables=this._ldsCache.getOrCreateObservables(recordLayoutCacheKey,this.getCacheValueTtl());// check if we already have a module observable for the layout template, and create it if not
    const _moduleObservables=this._moduleObservables;const moduleObservable=_moduleObservables.get(recordLayoutCacheKey.getKey());if(!moduleObservable){// We pass observables.unwrapped here
    const newObservable=this._constructModuleObservable(recordLayoutCacheKey,observables.finalTransformed);_moduleObservables.set(recordLayoutCacheKey.getKey(),newObservable);return newObservable;}return moduleObservable;}/**
         * Constructs an Observable that will emit a record with only those fields given by the requiredFields and optionalFields parameters.
         * If a required field is missing during an emit attempt, an error will be emitted. If an optional field is missing then it will be ignored.
         * @param recordLayoutCacheKey The record layout templatekey identifying the module observable.
         * @param observableToFilter The observable that emits an aura module
         * @returns Observable An observable the emits an aura module
         */_constructModuleObservable(recordLayoutCacheKey,observableToFilter){let moduleObservable=observableToFilter;moduleObservable=moduleObservable.filter(aura.hasModule).map(aura.getModule);// Subscribe to the new filtered observable so that when it completes (or errors) we know to remove the filtered observable from the map.
    const errorCompleteSubscription=moduleObservable.subscribe({next:()=>{/* do nothing */},error:()=>{this._moduleObservables.delete(recordLayoutCacheKey.getKey());},complete:()=>{this._moduleObservables.delete(recordLayoutCacheKey.getKey());}});// Decorate the subscribe method to return a Subscription instance with a decorated unsubscribe method which will dispose the module observable if
    // the subscriptions count drops below 1. (Not 0 because of the above subscription which will always be there but doesn't signify that
    // there is someone interested in this module observable externally.
    const _moduleObservables=this._moduleObservables;const originalSubscribeFn=moduleObservable.subscribe;moduleObservable.subscribe=(observer,...args)=>{const originalSubscription=originalSubscribeFn.call(moduleObservable,observer,...args);if(originalSubscription){const originalSubscriptionUnsubscribeFn=originalSubscription.unsubscribe;originalSubscription.unsubscribe=()=>{originalSubscriptionUnsubscribeFn.call(originalSubscription);if(moduleObservable.subscriptions.size<=1){if(errorCompleteSubscription&&!errorCompleteSubscription.closed){errorCompleteSubscription.unsubscribe();}_moduleObservables.delete(recordLayoutCacheKey.getKey());}};}return originalSubscription;};return moduleObservable;}/**
         * Constructs a value provider to retrieve a layout descriptor.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve a layout descriptor.
         */_createLayoutTemplateDescriptorValueProvider(valueProviderParameters){const{recordLayoutCacheKey,recordId,layoutType,mode,dynamicComponentType,forceProvide,recordTypeChanged}=valueProviderParameters;const layoutTemplateDescriptorValueProvider=new ValueProvider(cacheAccessor=>{cacheAccessor=recordServiceUtils.wrapCacheAccessor(cacheAccessor,this._adsBridge);// W-5043986: Fix this as part of this story.
    // if recordType has changed, then look for layout descriptor with new recordType in cache, and if the layout descriptor with new recordType is not present in cache,
    // we fetch everything from DynamicComponentController
    if(recordTypeChanged){return this._lookForLayoutDescriptorInCache(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);}if(forceProvide){return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);}return cacheAccessor.get(recordLayoutCacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;// check for ttl expiry
    const needsRefresh=nowTime>lastFetchTime+RECORD_LAYOUT_VALUES_TTL;if(needsRefresh){// Trigger a refresh. We don't care about the return value of this, we just need to force an API call
    // to keep the Observable's data stream alive.
    return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);}return ValueProviderResult.CACHE_HIT;}// look for layout descriptor in cache, and it the layout descriptor is not present in cache,
    // we fetch everything from DynamicComponentController
    return this._lookForLayoutDescriptorInCache(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);});},valueProviderParameters);return layoutTemplateDescriptorValueProvider;}/**
         * Normalize the layout descriptor and create dependency for record layout on the layout descriptor and the record.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record layout depends.
         * @param layoutDescriptorCacheKey Cache key for layout descriptor.
         * @param recordLayoutCacheKey Cache key for record layout.
         * @param dynamicComponentDescriptor The layout descriptor that needs to be normalized.
         */_normalizeAndStagePutComponentDescriptor(cacheAccessor,recordId,layoutDescriptorCacheKey,recordLayoutCacheKey,dynamicComponentDescriptor){// stage the dependency for record layout cache key on the record cache key so that if recordTypeId changes, then we get notified and we can handle the changes appropriately
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();cacheAccessor.stageDependencies([recordLayoutCacheKey],recordCacheKey);const normalizedComponentDescriptor=clone(dynamicComponentDescriptor,recordLayoutCacheKey);const normalizedObjectComponentDescriptor=this._getNormalizedComponentDescriptor(layoutDescriptorCacheKey,cacheAccessor.nowTime);cacheAccessor.stagePut([recordLayoutCacheKey],layoutDescriptorCacheKey,normalizedComponentDescriptor,dynamicComponentDescriptor);return cacheAccessor.stagePut([],recordLayoutCacheKey,normalizedObjectComponentDescriptor,dynamicComponentDescriptor);}/**
         * Stage put record layout and stage dependencies on the already existing layout descriptor and record that exists in cache.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record layout depends.
         * @param layoutDescriptorCacheKey Cache key for layout descriptor.
         * @param recordLayoutCacheKey Cache key for record layout.
         * @param dynamicComponentDescriptor The layout descriptor that needs to be normalized.
         */_stageDependencyNormalizeAndStagePutRecordLayout(cacheAccessor,recordId,layoutDescriptorCacheKey,recordLayoutCacheKey,dynamicComponentDescriptor){// Stage the dependency for record layout cache key on the record cache key so that if recordTypeId changes, then we get notified and we can handle the changes appropriately
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();cacheAccessor.stageDependencies([recordLayoutCacheKey],recordCacheKey);// Stage dependency for record layout cache key on the layout descriptor
    cacheAccessor.stageDependencies([recordLayoutCacheKey],layoutDescriptorCacheKey);// Normalize and stage put the layout component descriptor
    const normalizedObjectComponentDescriptor=this._getNormalizedComponentDescriptor(layoutDescriptorCacheKey,cacheAccessor.nowTime);return cacheAccessor.stagePut([],recordLayoutCacheKey,normalizedObjectComponentDescriptor,dynamicComponentDescriptor);}/**
         * Helper function to normalize and create marker for layout component descriptor.
         * @param layoutDescriptorCacheKey Cache key for the layout descriptor.
         * @returns Record layout marker.
         */_getNormalizedComponentDescriptor(layoutDescriptorCacheKey,timestamp){const keyBuilder=DescriptorLayoutCacheKeyBuilder.fromCacheKey(layoutDescriptorCacheKey);const normalizedObjectComponentDescriptor=new RecordLayoutCacheValueMarkerBuilder().setTimestamp(timestamp).setObjectApiName(keyBuilder.getObjectApiName()).setRecordTypeId(keyBuilder.getRecordTypeId()).setLayoutType(keyBuilder.getLayoutType()).setMode(keyBuilder.getMode()).setDynamicComponentType(keyBuilder.getDynamicComponentType()).build();return normalizedObjectComponentDescriptor;}/**
         * Takes the normalized record layout and cacheAccessor and returns the denormalized record layout.
         * @param normalizedRecordLayout The record layout to be denormalized. This should always be a normalized record layout that came from the cache.
         * @param cacheAccessor The CacheAccessor in scope for this operation.
         * @param recordLayoutCacheKey Cache key for the record layout.
         * @returns The denormalized record layout.
         */_denormalizeRecordLayout(normalizedRecordLayout,cacheAccessor,recordLayoutCacheKey){{assert$1(recordLayoutCacheKey.getValueType()===RECORD_LAYOUT_VALUE_TYPE,`Expected RECORD_LAYOUT_VALUE_TYPE value type for RecordLayout: ${recordLayoutCacheKey.getValueType().toString()}`);}let denormalizedRecordLayout=clone(normalizedRecordLayout,recordLayoutCacheKey);// build the layout descriptor cache key object
    const layoutDescriptorCacheKey=new DescriptorLayoutCacheKeyBuilder().setObjectApiName(normalizedRecordLayout.objectApiName).setRecordTypeId(normalizedRecordLayout.recordTypeId).setLayoutType(normalizedRecordLayout.layoutType).setMode(normalizedRecordLayout.mode).setDynamicComponentType(normalizedRecordLayout.dynamicComponentType).build();cacheAccessor.get(layoutDescriptorCacheKey).then(layoutDescriptorValueWrapper=>{if(layoutDescriptorValueWrapper){denormalizedRecordLayout=clone(layoutDescriptorValueWrapper.value,layoutDescriptorCacheKey);}});return denormalizedRecordLayout;}/**
         * Helper method to build the layout descriptor cache key.
         * @param record The record used to fetch the recordTypeId to construct the layout descriptor cache key.
         * @param layoutType The layout type used to construct the layout descriptor cache key.
         * @param mode The mode used to construct the layout descriptor cache key.
         * @param dynamicComponentType The component for which this layout is loaded.
         * @returns The layout descriptor cache key.
         */_buildLayoutDescriptorCacheKeyWithRecord(record,layoutType,mode,dynamicComponentType){const recordTypeId=record.recordTypeInfo?record.recordTypeInfo.recordTypeId:MASTER_RECORD_TYPE_ID$2;return this._buildLayoutDescriptorCacheKey(record.apiName,recordTypeId,layoutType,mode,dynamicComponentType);}/**
         * Helper method to build the layout descriptor cache key.
         * @param apiName The api name used to construct the layout descriptor cache key.
         * @param recordTypeId The recordTypeId used to construct the layout descriptor cache key.
         * @param layoutType The layout type used to construct the layout descriptor cache key.
         * @param mode The mode used to construct the layout descriptor cache key.
         * @param dynamicComponentType The component for which this layout is loaded.
         * @returns The layout descriptor cache key.
         */_buildLayoutDescriptorCacheKey(apiName,recordTypeId,layoutType,mode,dynamicComponentType){const layoutCacheKey=new DescriptorLayoutCacheKeyBuilder().setObjectApiName(apiName).setRecordTypeId(recordTypeId).setLayoutType(layoutType).setMode(mode).setDynamicComponentType(dynamicComponentType).build();return layoutCacheKey;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record layout depends.
         * @param layoutType The layout type for which the layout descriptor is being requested.
         * @param mode The mode for which the layout descriptor is being requested.
         * @param dynamicComponentType The component for which this layout is loaded.
         * @param recordLayoutCacheKey Cache key for record layout.
         * @param dynamicComponentDescriptor The layout descriptor that needs to be normalized. Optional.
         * @param layoutDescriptorCacheKey layoutDescriptorCacheKey Cache key for layout descriptor. Optional.
         */_getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey,dynamicComponentDescriptor,layoutDescriptorCacheKey){let layoutTemplateDescriptorThenable;// If the dynamicComponentDescriptor is provided, we don't go to server to fetch it.
    if(dynamicComponentDescriptor){layoutTemplateDescriptorThenable=ThenableFactory.resolve(undefined);}else{const params={type:dynamicComponentType,params:{layoutType,mode},expansionHints:{recordId}};layoutTemplateDescriptorThenable=executeTemplateController(params,cacheAccessor,this._ldsCache,DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE);}return layoutTemplateDescriptorThenable.then(freshValue=>{if(!dynamicComponentDescriptor){{assert$1(freshValue.additionalParams.objectApiName,`objectApiName is required for record layout template`);assert$1(freshValue.additionalParams.recordTypeId,`objectApiName is required for record layout template`);}// build the layout descriptor cache key
    layoutDescriptorCacheKey=this._buildLayoutDescriptorCacheKey(freshValue.additionalParams.objectApiName,freshValue.additionalParams.recordTypeId,layoutType,mode,dynamicComponentType);dynamicComponentDescriptor=freshValue.descriptor;// normalize and stage put the component descriptor
    return this._normalizeAndStagePutComponentDescriptor(cacheAccessor,recordId,layoutDescriptorCacheKey,recordLayoutCacheKey,dynamicComponentDescriptor);}{assert$1(layoutDescriptorCacheKey,`layoutDescriptorCacheKey should be provided: $layoutDescriptorCacheKey`);}if(layoutDescriptorCacheKey){{assert$1(layoutDescriptorCacheKey.getValueType()!==undefined,`Value type for layout descriptor was undefined.`);assert$1(layoutDescriptorCacheKey.getValueType()===DESCRIPTOR_RECORD_LAYOUT_VALUE_TYPE,`Unexpected value type for layout: ${layoutDescriptorCacheKey.getValueType().toString()}`);}// update dependency and stage put only the record layout
    return this._stageDependencyNormalizeAndStagePutRecordLayout(cacheAccessor,recordId,layoutDescriptorCacheKey,recordLayoutCacheKey,dynamicComponentDescriptor);}}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}/**
         * Helper function to check the cache for a layout descriptor.
         * @param cacheAccessor An object to access cache directly.
         * @param recordId The id of the record on which the record layout depends.
         * @param layoutType The layout type for which the layout descriptor is being requested.
         * @param mode The mode for which the layout descriptor is being requested.
         * @param dynamicComponentType The component for which this layout is loaded.
         */_lookForLayoutDescriptorInCache(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey){// check if there exists a record in cache
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return cacheAccessor.get(recordCacheKey).then(existingRecordValue=>{if(existingRecordValue&&existingRecordValue.value!==undefined){// build the layout descriptor cache key
    const existingRecord=existingRecordValue.value;const layoutDescriptorCacheKey=this._buildLayoutDescriptorCacheKeyWithRecord(existingRecord,layoutType,mode,dynamicComponentType);// check if the layout descriptor exists in the cache
    return cacheAccessor.get(layoutDescriptorCacheKey).then(existingLayoutDescriptor=>{if(existingLayoutDescriptor&&existingLayoutDescriptor.value!==undefined){const existingLayoutDescriptorValue=existingLayoutDescriptor.value;const layoutNowTime=cacheAccessor.nowTime;const layoutLastFetchTime=existingLayoutDescriptor.lastFetchTime;// check for ttl expiry of the layout descriptor
    const layoutDescriptorNeedsRefresh=layoutNowTime>layoutLastFetchTime+RECORD_LAYOUT_VALUES_TTL;if(layoutDescriptorNeedsRefresh){// if layout descriptor is present in cache and ttl of layout descriptor has expired, then fetch everything from DynamicComponentController
    return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);}// if layout descriptor is present in cache and ttl has not expired, then stagePut the descriptor and return CACHE_MISS
    return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey,existingLayoutDescriptorValue,layoutDescriptorCacheKey);}// if layout descriptor is not present in cache then fetch everything from DynamicComponentController
    return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);});}// if record is not present in cache then fetch everything from DynamicComponentController
    return this._getFreshValue(cacheAccessor,recordId,layoutType,mode,dynamicComponentType,recordLayoutCacheKey);});}/**
         * Affected key handler for RecordLayoutDynamicComponent values. The cache will call this handler when a RecordLayoutDynamicComponent cache value
         * could have been affected by a change in another related cache key value.
         * @param affectedKey The cache key of the affected RecordLayoutDynamicComponent cache value.
         * @param cacheAccessor The instance of the cache accessor that contains the current transaction.
         */_affectedKeyHandler(affectedKey,cacheAccessor){{assert$1(affectedKey.getValueType()===RECORD_LAYOUT_VALUE_TYPE,`Expected RECORD_LAYOUT_VALUE_TYPE value type for RecordLayout: ${affectedKey.getValueType().toString()}`);}return cacheAccessor.get(affectedKey).then(normalizedRecordLayoutValueWrapper=>{if(normalizedRecordLayoutValueWrapper){{assert$1(typeUtils.isInstanceOf(normalizedRecordLayoutValueWrapper,ValueWrapper),`normalizedRecordLayoutValueWrapper was not an instance of ValueWrapper: ${normalizedRecordLayoutValueWrapper}`);}// Fetch params from affected key
    const keyBuilder=RecordLayoutCacheKeyBuilder.fromCacheKey(affectedKey);const recordLayoutCacheKey=keyBuilder.build();const recordId=keyBuilder.getRecordId();const layoutType=keyBuilder.getLayoutType();const mode=keyBuilder.getMode();const dynamicComponentType=keyBuilder.getDynamicComponentType();// Figure out if the recordTypeId of the record has changed
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();const refreshedRecordValueWrapper=cacheAccessor.getCommitted(recordCacheKey);const existingRecord=normalizedRecordLayoutValueWrapper.value;const existingRecordTypeId=existingRecord.recordTypeId;let recordTypeChanged=false;if(refreshedRecordValueWrapper){const refreshedRecord=refreshedRecordValueWrapper.value;{assert$1(refreshedRecord,`unexpected falsy value for refreshedRecord: ${refreshedRecord}`);}const newRecordTypeId=refreshedRecord.recordTypeInfo?refreshedRecord.recordTypeInfo.recordTypeId:MASTER_RECORD_TYPE_ID$2;if(newRecordTypeId!==existingRecordTypeId){recordTypeChanged=true;}}if(!recordTypeChanged){// if recordTypeId has not changed, there is no need to force refresh, denorm the value of component descriptor and emit
    const denormedComponentDescriptor=this._denormalizeRecordLayout(existingRecord,cacheAccessor,affectedKey);if(denormedComponentDescriptor&&aura.hasModule(denormedComponentDescriptor)){const componentDescriptorValueWrapperToEmit=ValueWrapper.cloneWithValueOverride(normalizedRecordLayoutValueWrapper,denormedComponentDescriptor);cacheAccessor.stageEmit(affectedKey,componentDescriptorValueWrapperToEmit);return undefined;}}// When recordTypeId has changed, we need to do figure out whether we need a full refresh of the recordLayoutCache.
    // or the layout descriptor with updated recordType already exists in cache.
    // However we're already in a cache transaction.
    // Kick this to a Promise to get this out of the cache operation we're already in the middle of.
    // and then figure out if we have everything required in cache or we need to queue a fresh request
    return Promise.resolve().then(()=>{const forceProvide=false;// For now set it to false, if we cannot find the updated layout descriptor in cache, we will make it forceProvide
    recordTypeChanged=true;// we know that record type has changed, so ignore the force provide until we cannot find the updated layout descriptor in cache
    const vpArgs={recordLayoutCacheKey,recordId,layoutType,mode,dynamicComponentType,forceProvide,recordTypeChanged};this._ldsCache.get(affectedKey,this._createLayoutTemplateDescriptorValueProvider(vpArgs));return undefined;});}else if(this._ldsCache.getObservables(affectedKey)){// There is an observable for this affectedKey but we couldn't find its value in the cache.
    // TODO W-4485745: If we can't denormalize the record layout, we should do the following:
    // - Don't emit yet.
    // - Refresh the value from server.
    {assert$1(false,`Need to denorm/emit a RecordLayout we no longer have in cache: ${affectedKey.getKey()}`);}}});}}/**
     * Wire adapter id: getRecordLayoutTemplate.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     */function getRecordLayoutTemplate(){throw generateError("getRecordLayoutTemplate");}/**
     * Generates the wire adapters for:
     *      * @wire getRecordLayoutTemplate
     */class RecordLayoutWireAdapterGenerator{/**
         * Constructor.
         * @param recordLayoutService Reference to the RecordLayoutService instance.
         */constructor(recordLayoutService){this._recordLayoutService=recordLayoutService;}/**
         * Generates the wire adapter for @wire getLayoutTemplate.
         * @returns See description.
         */generateGetRecordLayoutTemplateWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetRecordLayoutTemplate.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Service @wire getRecordUi.
         * @param config Config params for the service. The type is or'd with any so that we can test sending bad configs. Consumers will be able to send us bad configs.
         * @return Observable stream that emits a record layout template object.
         */_serviceGetRecordLayoutTemplate(config){if(!config){return undefined;}if(!config.recordId||!config.layoutType||!config.mode||!config.dynamicComponentType){return undefined;}const recordId=to18(config.recordId);return this._recordLayoutService.getLayoutTemplateModule(recordId,config.layoutType,config.mode,config.dynamicComponentType);}}/**
     * Value type for relatedListRecord actions
     */const RELATEDLISTRECORD_ACTIONS_VALUE_TYPE="lds.RelatedListRecordActions";/**
     * relatedListRecordActions expires in 5 minutes in the cache
     */const RELATEDLISTRECORD_ACTIONS_TTL=5*60*1000;/**
     * Cache key builder for relatedListRecord actions
     * @extends CacheKeyBuilder
     */class RelatedListRecordActionsCacheKeyBuilder extends CacheKeyBuilder{/**
         * Default constructor
         */constructor(){super(RELATEDLISTRECORD_ACTIONS_VALUE_TYPE);}/**
         * Set the record id
         * @param recordId record ids
         * @returns This builder
         */setRecordId(recordId){this.recordId=recordId;return this;}/**
         * Set the relatedListRecord id
         * @returns This builder
         * @param relatedListRecordIds
         */setRelatedListRecordIds(relatedListRecordIds){this.relatedListRecordIds=relatedListRecordIds;return this;}/**
         * Sets form factor
         * @param formFactor The form factor
         * @returns This builder
         */setFormFactor(formFactor){this.formFactor=formFactor;return this;}/**
         * Sets the list of sections
         * @param sections The list of sections
         * @returns This builder
         */setSections(sections){this.sections=sections;return this;}/**
         * Sets the list of action types
         * @param actionTypes The list of action types
         * @returns This builder
         */setActionTypes(actionTypes){this.actionTypes=actionTypes;return this;}/**
         * @returns Cache key for related list record actions
         */build(){{assert$1(this.recordId,"A non-empty recordId must be provided");assert$1(this.relatedListRecordIds.length,"A non-empty relatedListRecordIds must be provided");}const recordId=this.recordId;const relatedListRecordIds=stableCommaDelimitedString(this.relatedListRecordIds);const formFactor=this.formFactor||"";const sections=stableCommaDelimitedString(this.sections);const actionTypes=stableCommaDelimitedString(this.actionTypes);const key=[recordId,relatedListRecordIds,formFactor,sections,actionTypes].join(KEY_DELIM);return new CacheKey(this.getValueType(),key);}}/**
     * Quick and dirty function to reconstruct related-list-record actions parameters from a cache key
     * @param affectedKey A cache key
     * @returns RelatedListRecord actions parameters
     */function reverseEngineer$2(affectedKey){const reverseJoin=str=>str?str.split(","):[];const components=affectedKey.getKey().split(KEY_DELIM);return {recordId:components[1],relatedListRecordIds:reverseJoin(components[2]),formFactor:components[3],sections:reverseJoin(components[4]),actionTypes:reverseJoin(components[5])};}/**
     * The ui api end point of relatedListRecord actions
     */const ACTIONS_GLOBAL_CONTROLLER$2="ActionsController.getRelatedListRecordActions";/**
     * RelatedListRecord actions service
     * @extends LdsServiceBase
     */class RelatedListRecordActionsService extends LdsServiceBase{constructor(ldsCache,functionProvidesValueProviderFunction){super(ldsCache,[RELATEDLISTRECORD_ACTIONS_VALUE_TYPE]);/**
             * @returns A higher order of function that returns an affected key handler
             */this.affectedKeyHandler=(affectedKey,cacheAccessor)=>{const parameters=reverseEngineer$2(affectedKey);const hasDependencyUpdated=parameters.relatedListRecordIds.some(relatedListRecordId=>{const{dependencies}=this.getCacheKeyDependencyOfKey(parameters,parameters.recordId+","+relatedListRecordId);return dependencies.some(dependency=>!!cacheAccessor.getCommitted(dependency));});if(hasDependencyUpdated){this._ldsCache.get(affectedKey,new ValueProvider(this.getValueProviderFn(affectedKey,parameters,true),{}));return Thenable.resolve();}return cacheAccessor.get(affectedKey).then(oldValueWrapper=>{if(oldValueWrapper){return denormalizePayload(cacheAccessor,affectedKey,this.getCacheKeyDependencyOfKey.bind(this,parameters)).then(updatedActionPayloadToEmit=>{const transformedPayloadToEmit=payloadTransformToRecordIdKey(updatedActionPayloadToEmit);const valueWrapper=ValueWrapper.cloneWithValueOverride(oldValueWrapper,transformedPayloadToEmit);cacheAccessor.stageEmit(affectedKey,valueWrapper);});}return Thenable.resolve();});};this._functionProvidesValueProviderFunction=functionProvidesValueProviderFunction;}getCacheValueTtl(){return RELATEDLISTRECORD_ACTIONS_TTL;}/**
         * @returns A higher order function to return an affected key handler
         */getAffectedKeyHandler(){return this.affectedKeyHandler;}/**
         * Wire service to provide relatedListRecord actions
         * @param recordId The recordId for its relatedListRecord actions
         * @param relatedListRecordIds the list of relatedListRecord ids for their relatedListRecord actions
         * @param requestParams The request parameters to filter the resulting actions
         * @returns Observable of the list of relatedListRecord actions
         */getRelatedListRecordActions(recordIdEntry,relatedListRecordIdsEntry,requestParams){const parameters=Object.assign({},{recordId:recordIdEntry},{relatedListRecordIds:relatedListRecordIdsEntry},requestParams);const cacheKey=this.buildCacheKey(parameters);const valueProviderFunction=this._functionProvidesValueProviderFunction?this._functionProvidesValueProviderFunction(cacheKey,parameters,false):this.getValueProviderFn(cacheKey,parameters,false);return this._ldsCache.get(cacheKey,new ValueProvider(valueProviderFunction,{}));}/**
         * Stage puts the given action.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param action The action to stagePut.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,action,cacheAccessor,additionalData){const relatedListRecordActionCacheKey=this.buildCacheKey(additionalData);cacheAccessor.stagePut(dependentCacheKeys,relatedListRecordActionCacheKey,action,action);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the this._functionProvidesValueProviderFunctiongiven action by directly deleting them.
         * @param action The action from which to strip the eTags.
         * @returns The given action with its eTags stripped.
         */stripETagsFromValue(action){delete action.eTag;return action;}/**
         * A higher order function to provide a value provider function
         * @param cacheKey The cache key
         * @param params The relatedListRecord action parameters for the transaction
         * @param forceFetch Indicates whether a server round trip is forced
         * @returns A value provider function
         */getValueProviderFn(cacheKey,params,forceFetch){return cacheAccessor=>{return cacheAccessor.get(cacheKey).then(cacheEntry=>{if(!forceFetch&&this.doesCacheEntryHasValue(cacheEntry)&&this.hasNotExpired(cacheAccessor.nowTime,cacheEntry)){return Thenable.resolve(ValueProviderResult.CACHE_HIT);}return this.primeCacheEntries(params,cacheAccessor,cacheKey).then(result=>{if(cacheEntry&&cacheEntry.eTag&&result.eTag&&cacheEntry.eTag===result.eTag){return ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED;}else{return ValueProviderResult.CACHE_MISS;}});});};}/**
         * Makes a server round trip and normalizes the response
         * @param parameters The relatedlistRecord action parameters for the round trip
         * @param cacheAccessor The cache accessor for the transaction
         * @param cacheKey The cache key for the payload
         * @returns The action representation
         */primeCacheEntries(parameters,cacheAccessor,cacheKey){return executeAuraGlobalController(ACTIONS_GLOBAL_CONTROLLER$2,parameters).then(response=>{return response.body;}).then(result=>{const transformedResult=payloadTransformToGroupedIdKey(result);normalizePayload(cacheAccessor,this.getCacheKeyDependencyOfKey.bind(this,parameters),cacheKey,transformedResult);return cacheAccessor.commitPuts().then(affectedKeys=>Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor))).then(()=>result);});}/**
         * Builds a relatedListRecord action cache key from parameters
         * @param parameters The relatedListRecord actions parameters
         * @returns A cache key for relatedListRecord actions
         */buildCacheKey(parameters){const{recordId,relatedListRecordIds,formFactor,actionTypes,sections}=parameters;return new RelatedListRecordActionsCacheKeyBuilder().setRecordId(recordId).setRelatedListRecordIds(relatedListRecordIds).setFormFactor(formFactor).setActionTypes(actionTypes).setSections(sections).build();}/**
         * Calculates the cache key and dependencies provided the parameters for the request
         * @param formFactor The form factor
         * @param sections The sections
         * @param actionTypes The action types
         * @param key - recordId+relatedListRecordId
         * @returns The cache key of the request along with their dependencies
         */getCacheKeyDependencyOfKey({formFactor,sections,actionTypes},key){const recordId=key.split(",")[0];const relatedListRecordId=key.split(",")[1];const cacheKey=new RelatedListRecordActionsCacheKeyBuilder().setRecordId(recordId).setRelatedListRecordIds([relatedListRecordId]).setFormFactor(formFactor).setSections(sections).setActionTypes(actionTypes).build();const relatedListRecordCacheKey=new RecordCacheKeyBuilder().setRecordId(relatedListRecordId).build();return {cacheKey,dependencies:[relatedListRecordCacheKey]};}/**
         * A function to check whether cache entry has expired
         * @param now Current timestamp
         * @param entry Cache entry
         * @returns Whether cache entry has expired
         */hasNotExpired(now,entry){return !isNaN(now)&&!isNaN(entry.lastFetchTime)&&now-entry.lastFetchTime<RELATEDLISTRECORD_ACTIONS_TTL;}/**
         * A function to check whether cache entry has a value
         * @param entry Cache entry
         * @returns Whether the cache entry has a value
         */doesCacheEntryHasValue(entry){return entry?entry.value!==undefined:false;}}/**
     * Transform action payload to {actions: {recordId+relatedListId: {actions: []}}, {...}}
     * @param standardPayload - the orignial payload
     * @returns {actions: {recordId+relatedListId: {actions: []}}, {...}}
     */function payloadTransformToGroupedIdKey(standardPayload){const recordId=Object.keys(standardPayload.actions)[0];const actions=standardPayload.actions[recordId].actions;const result={actions:{},eTag:standardPayload.eTag,url:standardPayload.url};for(const action of actions){const key=action.sourceObject+","+action.relatedListRecordId;if(result.actions[key]){result.actions[key].actions.push(action);}else{result.actions[key]={actions:[action],links:standardPayload.actions[recordId].links,url:standardPayload.actions[recordId].url};}}return result;}/**
     * Transform action payload back as standard payload
     * @param payload
     * @returns standardPayload
     */function payloadTransformToRecordIdKey(payload){const originalKeys=Object.keys(payload.actions);const recordId=originalKeys[0].split(",")[0];const result={actions:{}};let actionsResult=[];for(const originalKey of originalKeys){const actions=payload.actions[originalKey].actions;actionsResult=actionsResult.concat(actions);}result.actions[recordId]={actions:actionsResult};return result;}/**
     * Wire adapter id: getRelatedListRecord
     * @throws Always throws when invoked. Imperative invocation is not supported.
     * */function getRelatedListRecordActions(){throw generateError("getRelatedListRecordActions");}/**
     * Generates the wire adapter for RelatedListRecord Actions.
     * */class RelatedListRecordActionsWireAdapterGenerator{constructor(relatedListRecordActionsService){this._relatedListRecordActionsService=relatedListRecordActionsService;}/**
         * Generates the wire adapter for getRelatedListRecordActions.
         * @returns WireAdapter - See description.
         */generateGetRelatedListRecordActionsWireAdapter(){return generateWireAdapter(this.serviceGetRelatedListRecordActions.bind(this));}/**
         * Service getRelatedListRecordActions @wire.
         * @param recordId
         * @param relatedListRecordIds
         * @param config
         * @returns relatedListRecordActions
         */serviceGetRelatedListRecordActions(recordId,relatedListRecordIds,config){return this._relatedListRecordActionsService.getRelatedListRecordActions(recordId,relatedListRecordIds,config);}}/**
     * The valueType to use when building DescriptorFlexipage.
     */const FLEXIPAGE_DESCRIPTOR_VALUE_TYPE="lds.DescriptorFlexipage";/**
     * Time to live for a flexipage descriptor cache value. 30 days.
     */const FLEXIPAGE_DESCRIPTOR_TTL=2592000000;// 30 days.
    /**
     * Constructs a cache key for the Flexipage Template. Keys are constructed from:
     * objectApiName
     * pageDeveloperName
     *
     * Flexipage Template cache key is used as cache key for Descriptor of a Flexipage.
     */class FlexipageCacheKeyBuilder extends CacheKeyBuilder{/**
         * Constructor
         */constructor(){super(FLEXIPAGE_DESCRIPTOR_VALUE_TYPE);}/**
         * Sets the objectApiName for the cache key.
         * @param objectApiName The object api name with which the Flexipage is associated.
         * @returns object The current object. Useful for chaining method calls.
         */setObjectApiName(objectApiName){this.objectApiName=objectApiName?objectApiName:"";return this;}/**
         * Sets the pageDeveloperName for the cache key.
         * @param pageDeveloperName Developer Name of the Flexipage
         * @returns object The current object. Useful for chaining method calls.
         */setPageDeveloperName(pageDeveloperName){this.pageDeveloperName=pageDeveloperName;return this;}/**
         * Builds the cache key.
         * @returns CacheKey A new cache key representing the Layout value type.
         */build(){{assert$1(this.pageDeveloperName,"A non-empty pageDeveloperName must be provided.");}return new CacheKey(this.getValueType(),`${this.pageDeveloperName}${KEY_DELIM}${this.objectApiName}`);}}/**
     * Generated Component Type for Flexipages
     */const FLEXIPAGE_GENERATED_COMPONENT_TYPE="Flexipage";/**
     * Provides functionality to read flexipage descriptor from the cache. Can refresh the data from the server.
     */class FlexipageService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         */constructor(ldsCache){super(ldsCache,[FLEXIPAGE_DESCRIPTOR_VALUE_TYPE]);}getCacheValueTtl(){return FLEXIPAGE_DESCRIPTOR_TTL;}/**
         * Strips all eTag properties from the given dynamicComponentDescriptor by directly deleting them.
         * @param dynamicComponentDescriptor The dynamicComponentDescriptor from which to strip the eTags.
         * @returns The given dynamicComponentDescriptor with its eTags stripped.
         */stripETagsFromValue(dynamicComponentDescriptor){return dynamicComponentDescriptor;}/**
         * Stage puts the given dynamicComponentDescriptor.
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param generatedComponentDescriptor The generatedComponentDescriptor to cache.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData A property bag with additional values that are needed to generate the cache key.
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,generatedComponentDescriptor,cacheAccessor,additionalData){const cacheKey=new FlexipageCacheKeyBuilder().setObjectApiName(additionalData.objectApiName).setPageDeveloperName(additionalData.pageDeveloperName).build();this.normalizeAndStagePut([],cacheKey,generatedComponentDescriptor,cacheAccessor);return ThenableFactory.resolve(undefined);}/**
         * Normalizes and stage puts given generatedComponentDescriptor
         * @param dependentCacheKeys An array of dependent cache keys.
         * @param cacheKey utilized by the value provider to fetch the value.
         * @param generatedComponentDescriptor The generatedComponentDescriptor to cache.
         * @param cacheAccessor An object to access cache directly.
         */normalizeAndStagePut(dependentCacheKeys,cacheKey,generatedComponentDescriptor,cacheAccessor){const normalizedComponentDescriptor=clone(generatedComponentDescriptor);return cacheAccessor.stagePut([],cacheKey,normalizedComponentDescriptor,generatedComponentDescriptor);}/**
         * Gets a Flexipage as a Module
         * @param pageDeveloperName The developer name of the page for which descriptor is being fetched.
         * @param objectApiName For Record Home/Object Home, Api Name of the Object flexipage belongs to.
         * @param expansionHints Expansion hints to be used for fetching dependent data
         * @returns The observable used to get the value and keep watch on it for changes.
         */getFlexipageTemplateModule(pageDeveloperName,objectApiName,expansionHints){const cacheKey=new FlexipageCacheKeyBuilder().setPageDeveloperName(pageDeveloperName).setObjectApiName(objectApiName).build();this.getFlexipageDescriptor(pageDeveloperName,objectApiName,expansionHints);const observables=this._ldsCache.getOrCreateObservables(cacheKey,this.getCacheValueTtl());return this._constructModuleObservable.call(this,observables.finalTransformed);}/**
         * Retrieves flexipage descriptor from the cache. If it doesn't exist in the cache it will retrieve it from the server and put it into the cache.
         * @param pageDeveloperName The developer name of the page for which descriptor is being fetched.
         * @param objectApiName For Record Home/Object Home, Api Name of the Object flexipage belongs to.
         * @param expansionHints Expansion hints to be used for fetching dependent data
         * @returns The observable used to get the value and keep watch on it for changes.
         */getFlexipageDescriptor(pageDeveloperName,objectApiName,expansionHints){const cacheKey=new FlexipageCacheKeyBuilder().setPageDeveloperName(pageDeveloperName).setObjectApiName(objectApiName).build();const valueProviderParameters={cacheKey,pageDeveloperName,objectApiName,expansionHints};const valueProvider=this._createFlexipageValueProvider(valueProviderParameters);const observable=this._ldsCache.get(cacheKey,valueProvider);return observable;}/**
         * Constructs a value provider to retrieve a Flexipage.
         * @param valueProviderParameters The parameters for the value provider as an object.
         * @returns The value provider to retrieve a flexipage.
         */_createFlexipageValueProvider(valueProviderParameters){const{cacheKey,pageDeveloperName,objectApiName,expansionHints}=valueProviderParameters;const flexipageValueProvider=new ValueProvider(cacheAccessor=>{return cacheAccessor.get(cacheKey).then(existingValueWrapper=>{if(existingValueWrapper&&existingValueWrapper.value!==undefined){const nowTime=cacheAccessor.nowTime;const lastFetchTime=existingValueWrapper.lastFetchTime;const needsRefresh=nowTime>lastFetchTime+FLEXIPAGE_DESCRIPTOR_TTL;if(needsRefresh){// Value is stale; get a fresh value.
    return this._getFreshValue(cacheKey,cacheAccessor,pageDeveloperName,objectApiName,expansionHints);}// The value is not stale so it's a cache hit.
    return ValueProviderResult.CACHE_HIT;}// No existing value; get a fresh value.
    return this._getFreshValue(cacheKey,cacheAccessor,pageDeveloperName,objectApiName,expansionHints);});},valueProviderParameters);return flexipageValueProvider;}/**
         * Constructs an Observable with Module defintion for a given Observable with descriptor
         * @param observableToFilter The observable that emits an aura module
         * @returns Observable An observable the emits an aura module
         */_constructModuleObservable(observableToFilter){let moduleObservable=observableToFilter;moduleObservable=moduleObservable.filter(aura.hasModule).map(aura.getModule);return moduleObservable;}/**
         * Gets a fresh value and processes it into the cache with the cacheAccessor.
         * @param cacheAccessor An object to transactionally access the cache.
         * @param cacheKey The cache key for the form.
         * @param apiName The form api name of the form to retrieve.
         * @param eTagToCheck eTag to send to the server to determine if we already have the latest value. If we do the server will return a 304.
         * @returns Returns a ValueProviderResult representing the outcome of the value provider.
         */_getFreshValue(cacheKey,cacheAccessor,pageDeveloperName,objectApiName,expansionHints){const params={type:FLEXIPAGE_GENERATED_COMPONENT_TYPE,params:{pageDeveloperName,objectApiName},expansionHints};return executeTemplateController(params,cacheAccessor,this._ldsCache,FLEXIPAGE_DESCRIPTOR_VALUE_TYPE).then(freshValue=>{const descriptor=freshValue.descriptor;const descriptorCacheKey=new FlexipageCacheKeyBuilder().setObjectApiName(objectApiName).setPageDeveloperName(pageDeveloperName).build();cacheAccessor.stageClearDependencies(descriptorCacheKey);// Nothing should depend on this yet; included for completeness.
    return this.normalizeAndStagePut([],descriptorCacheKey,descriptor,cacheAccessor);}).then(()=>{return cacheAccessor.commitPuts();}).then(affectedKeys=>{return Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor));}).then(()=>{return ValueProviderResult.CACHE_MISS;}).catch(rejectionReason=>{// TODO: W-4421269 - for some reason logError() causes some Aura UI tests to fail. Need to get to the bottom of that.
    {// tslint:disable-next-line:no-console
    console.log(rejectionReason);// Do not go gentle into that good night.
    }throw rejectionReason;});}}/**
     * Wire adapter id: getFlexipageTemplate.
     * @throws Error - Always throws when invoked. Imperative invocation is not supported.
     * @returns void
     */function getFlexipageTemplate(){throw generateError("getFlexipageTemplate");}/**
     * Generates Wire adapters for
     *   @wireAdapter getFlexipageTemplate
     */class FlexipageWireAdapterGenerator{/**
         * Constructor.
         * @param flexipageService Reference to the FlexipageService instance.
         */constructor(flexipageService){this._flexipageService=flexipageService;}/**
         * Generates the wire adapter for getRecord.
         * @returns WireAdapter - See description.
         */generateGetFlexipageTemplateWireAdapter(){const wireAdapter=generateWireAdapter(this._serviceGetFlexipageTemplate.bind(this));return wireAdapter;}/**
         * @private Made public for testing.
         * Service getFlexipageTemplate @wire.
         * @param config: object - Config params for the service.
         * @return Observable<object> - Observable stream that emits a Flexipage Module.
         */_serviceGetFlexipageTemplate(config){if(!config){return undefined;}if(!config.pageDeveloperName){return undefined;}const flexipageTemplateObservable=this._flexipageService.getFlexipageTemplateModule(config.pageDeveloperName,config.objectApiName,{recordId:config.recordId});return flexipageTemplateObservable;}}/**
     * Value type for record actions
     */const RECORD_ACTIONS_VALUE_TYPE="lds.RecordActions";/**
     * Record actions expires in 5 minutes in the cache
     */const RECORD_ACTIONS_TTL=5*60*1000;/**
     * Cache key builder for record actions
     * @extends CacheKeyBuilder
     */class RecordActionsCacheKeyBuilder extends CacheKeyBuilder{/**
         * Default constructor
         */constructor(){super(RECORD_ACTIONS_VALUE_TYPE);}/**
         * Set the list of record ids
         * @param recordIds The list of record ids
         * @return This builder
         */setRecordIds(recordIds){this._recordIds=recordIds;return this;}/**
         * Sets form factor
         * @param formFactor The form factor
         * @return This builder
         */setFormFactor(formFactor){this._formFactor=formFactor;return this;}/**
         * Sets the list of sections
         * @param sections The list of sections
         * @return This builder
         */setSections(sections){this._sections=sections;return this;}/**
         * Sets the list of action types
         * @param actionTypes The list of action types
         * @return This builder
         */setActionTypes(actionTypes){this._actionTypes=actionTypes;return this;}/**
         * Sets the retrieval mode
         * @param retrievalMode
         * @return This builder
         */setRetrievalMode(retrievalMode){this._retrievalMode=retrievalMode;return this;}/**
         * Sets the Api Names
         * @param apiNames
         * @return This builder
         */setApiNames(apiNames){this._apiNames=apiNames;return this;}/**
         * @return A cache key for record actions
         */build(){{assert$1(this._recordIds.length,"A non-empty recordIds must be provided");}const recordIds=stableCommaDelimitedString(this._recordIds);const formFactor=this._formFactor||"";const sections=stableCommaDelimitedString(this._sections);const actionTypes=stableCommaDelimitedString(this._actionTypes);const retrievalMode=this._retrievalMode||"";const apiNames=stableCommaDelimitedString(this._apiNames);const key=[recordIds,formFactor,sections,actionTypes,retrievalMode,apiNames].join(KEY_DELIM);return new CacheKey(this.getValueType(),key);}}/**
     * Quick and dirty function to reconstruct record actions parameters from a cache key
     * TODO revisit this approach in 218
     * @param affectedKey A cache key
     * @return Record actions parameters
     */function reverseEngineer$3(affectedKey){const reverseJoin=str=>str?str.split(","):[];// TODO to fix issues: 1. preserve case (toLowerCase() call here is a hack), 2. preserve default value
    // const [ valueType, recordIds, formFactor, sections, actionTypes, retrievalMode, apiNames ]: string[] = affectedKey.getKey().toLowerCase().split(KEY_DELIM);
    const[,recordIds,formFactor,sections,actionTypes,retrievalMode,apiNames]=affectedKey.getKey().split(KEY_DELIM);return {recordId:reverseJoin(recordIds),formFactor,sections:reverseJoin(sections),actionTypes:reverseJoin(actionTypes),retrievalMode,apiNames:reverseJoin(apiNames)};}/**
     * The ui api end point of record actions
     */const ACTIONS_GLOBAL_CONTROLLER$3="ActionsController.getRecordActions";/**
     * Record actions service
     */class RecordActionsService extends LdsServiceBase{/**
         * Constructor.
         * @param ldsCache Reference to the LdsCache instance.
         * @param affectedKeyHandlerInspector Used by tests to inspect the affectedKeyHandler.
         * @param valueProviderFunctionInspector Used by tests to inspect the valueProviderFunction.
         */constructor(ldsCache,functionProvidesValueProviderFunction){super(ldsCache,[RECORD_ACTIONS_VALUE_TYPE,ACTION_DEFINITION_VALUE_TYPE]);/**
             * Affected key handler instance for the service
             */this.affectedKeyHandler=(affectedKey,cacheAccessor)=>{const parameters=reverseEngineer$3(affectedKey);const hasDependencyUpdated=parameters.recordId.some(recordId=>{const{dependencies}=this.getCacheKeyDependencyOfKey(parameters,recordId);return dependencies.some(dependency=>!!cacheAccessor.getCommitted(dependency));});if(hasDependencyUpdated){this._ldsCache.get(affectedKey,new ValueProvider(this.getValueProviderFn(affectedKey,parameters,true),{}));return Thenable.resolve();}return cacheAccessor.get(affectedKey).then(oldValueWrapper=>{if(oldValueWrapper){return denormalizePayload(cacheAccessor,affectedKey,this.getCacheKeyDependencyOfKey.bind(this,parameters)).then(updatedActionPayloadToEmit=>{const valueWrapper=ValueWrapper.cloneWithValueOverride(oldValueWrapper,updatedActionPayloadToEmit);cacheAccessor.stageEmit(affectedKey,valueWrapper);});}return Thenable.resolve();});};this._functionProvidesValueProviderFunction=functionProvidesValueProviderFunction;}getCacheValueTtl(){return RECORD_ACTIONS_TTL;}/**
         * A function to check whether cache entry has expired
         * @param now Current timestamp
         * @param entry Cache entry
         * @returns Whether cache entry has expired
         */hasNotExpired(now,entry){return !isNaN(now)&&!isNaN(entry.lastFetchTime)&&now-entry.lastFetchTime<RECORD_ACTIONS_TTL;}/**
         * A function to check whether cache entry has a value
         * @param entry Cache entry
         * @return Whether the cache entry has a value
         */doesCacheEntryHasValue(entry){return entry?entry.value!==undefined:false;}/**
         * @return A higher order of function that returns an affected key handler
         */getAffectedKeyHandler(){return this.affectedKeyHandler;}/**
         * Wire service to provide record actions
         * @param The list of recordIds for their record detail actions
         * @param optionalParameters The optional parameters to further filter the resultant actions
         * @return Observable of the list of record actions
         */getRecordActions(recordIds,requestParams){const parameters=Object.assign({},{recordId:recordIds},requestParams);const cacheKey=this.buildCacheKey(parameters);const valueProviderFunction=this._functionProvidesValueProviderFunction?this._functionProvidesValueProviderFunction(cacheKey,parameters,false):this.getValueProviderFn(cacheKey,parameters,false);return this._ldsCache.get(cacheKey,new ValueProvider(valueProviderFunction,{}));}/**
         * Stage puts the given action.
         * @param dependentCacheKeys List of dependent cache keys.
         * @param action The action to stagePut.
         * @param cacheAccessor An object to access cache directly.
         * @param additionalData Data to build cache key with
         * @returns A Thenable that resolves when the stagePut has completed.
         */stagePutValue(dependentCacheKeys,action,cacheAccessor,additionalData){const recordActionCacheKey=this.buildCacheKey(additionalData);cacheAccessor.stagePut(dependentCacheKeys,recordActionCacheKey,action,action);return ThenableFactory.resolve(undefined);}/**
         * Strips all eTag properties from the given action by directly deleting them.
         * @param action The action from which to strip the eTags.
         * @returns The given action with its eTags stripped.
         */stripETagsFromValue(action){delete action.eTag;return action;}/**
         * A higher order function to provide a value provider function
         * @param cacheKey The cache key
         * @param params The record action parameters for the transaction
         * @param forceFetch Indicates whether a server round trip is forced
         * @return A value provider function
         */getValueProviderFn(cacheKey,params,forceFetch){return cacheAccessor=>{return cacheAccessor.get(cacheKey).then(cacheEntry=>{if(!forceFetch&&this.doesCacheEntryHasValue(cacheEntry)&&this.hasNotExpired(cacheAccessor.nowTime,cacheEntry)){return Thenable.resolve(ValueProviderResult.CACHE_HIT);}return this.primeCacheEntries(params,cacheAccessor,cacheKey).then(result=>{if(cacheEntry&&cacheEntry.eTag&&result.eTag&&cacheEntry.eTag===result.eTag){return ValueProviderResult.CACHE_MISS_REFRESH_UNCHANGED;}else{return ValueProviderResult.CACHE_MISS;}});});};}/**
         * Makes a server round trip and normalizes the response
         * @param parameters The record action parameters for the round trip
         * @param cacheAccessor The cache accessor for the transaction
         * @param cacheKey The cache key for the payload
         * @return The action representation
         */primeCacheEntries(parameters,cacheAccessor,cacheKey){return executeAuraGlobalController(ACTIONS_GLOBAL_CONTROLLER$3,parameters).then(response=>{return response.body;}).then(result=>{normalizePayload(cacheAccessor,this.getCacheKeyDependencyOfKey.bind(this,parameters),cacheKey,result);return cacheAccessor.commitPuts().then(affectedKeys=>Thenable.all(this._ldsCache.handleAffectedKeys(affectedKeys,cacheAccessor))).then(()=>result);});}/**
         * Builds a record action cache key from parameters
         * @param parameters The record actions parameters
         * @return A cache key for record actions
         */buildCacheKey(parameters){const{recordId:recordIds,formFactor,actionTypes,sections,retrievalMode,apiNames}=parameters;return new RecordActionsCacheKeyBuilder().setRecordIds(recordIds).setFormFactor(formFactor).setActionTypes(actionTypes).setSections(sections).setRetrievalMode(retrievalMode).setApiNames(apiNames).build();}/**
         * Calculates the cache key and dependencies provided the parameters for the request
         * @param formFactor The form factor
         * @param sections The sections
         * @param actionTypes The action types
         * @param recordId The record id
         * @return The cache key of the request along with their dependencies
         */getCacheKeyDependencyOfKey({formFactor,sections,actionTypes,retrievalMode,apiNames},recordId){const cacheKey=new RecordActionsCacheKeyBuilder().setRecordIds([recordId]).setFormFactor(formFactor).setSections(sections).setActionTypes(actionTypes).setRetrievalMode(retrievalMode).setApiNames(apiNames).build();// record data change leads to emitting updated values of both child and its parent
    // const recordUiCacheKey = new RecordUiCacheKeyBuilder()
    //     .setRecordIds([recordId])
    //     .setLayoutTypes(["FULL"])
    //     .setModes(["VIEW"])
    //     .build();
    const recordCacheKey=new RecordCacheKeyBuilder().setRecordId(recordId).build();return {cacheKey,dependencies:[recordCacheKey]};}}/**
     * Wire adapter id: getRecordActions.
     * @throws Always throws when invoked. Imperative invocation is not supported.
     */function getRecordActions(){throw generateError("getRecordActions");}/**
     * Generates the wire adapter for Record Actions.
     */class RecordActionsWireAdapterGenerator{/**
         * Constructor.
         * @param recordActionsService Reference to the RecordActionsService instance.
         */constructor(recordActionsService){this._recordActionsService=recordActionsService;}/**
         * Generates the wire adapter for getRecordActions.
         * @returns See description.
         */generateGetRecordActionsWireAdapter(){return generateWireAdapter(this.serviceGetRecordActions.bind(this));}/**
         * Service getRecordActions @wire
         * @param config Parameters for the service
         * @returns Observable stream that emits record actions.
         */serviceGetRecordActions(config){return this._recordActionsService.getRecordActions(config.recordIds,config.requestParameters);}}/*
     * This is the container for LDS in lwc core.
     */ // Create the cache.
    const ldsCache=new LdsCache("LDS Production Cache",new InMemoryCacheStore(undefined,10000),new DefaultTimeSource(),new Instrumentation(new InstrumentationServiceAura()));// Create ads bridge.
    const adsBridge=new AdsBridge(ldsCache);// Create services.
    const apexService=new ApexService(ldsCache);const formService=new FormService(ldsCache);const formUiService=new FormUiService(ldsCache,adsBridge);const layoutService=new LayoutService(ldsCache);const layoutUserStateService=new LayoutUserStateService(ldsCache);const listUiService=new ListUiService(ldsCache);const lookupActionsService=new LookupActionsService(ldsCache);const lookupRecordsService=new LookupRecordsService(ldsCache);const objectInfoService=new ObjectInfoService(ldsCache);const picklistValuesService=new PicklistValuesService(ldsCache);const picklistValuesByRecordTypeService=new PicklistValuesByRecordTypeService(ldsCache);const recordActionsService=new RecordActionsService(ldsCache);const relatedListRecordActionsService=new RelatedListRecordActionsService(ldsCache);const recordAvatarService=new RecordAvatarService(ldsCache);const recordAvatarBulkService=new RecordAvatarBulkService(ldsCache);const recordDefaultsService=new RecordDefaultsService(ldsCache);const recordEditActionsService=new RecordEditActionsService(ldsCache);const recordFormService=new RecordFormService(ldsCache,adsBridge);const recordLayoutService=new RecordLayoutService(ldsCache,adsBridge);const recordService=new RecordService(ldsCache,adsBridge);const recordUiService=new RecordUiService(ldsCache,adsBridge);const flexipageService=new FlexipageService(ldsCache);// Register services.
    ldsCache.registerService(apexService);ldsCache.registerService(formService);ldsCache.registerService(formUiService);ldsCache.registerService(layoutService);ldsCache.registerService(layoutUserStateService);ldsCache.registerService(listUiService);ldsCache.registerService(lookupActionsService);ldsCache.registerService(lookupRecordsService);ldsCache.registerService(objectInfoService);ldsCache.registerService(picklistValuesService);ldsCache.registerService(picklistValuesByRecordTypeService);ldsCache.registerService(recordActionsService);ldsCache.registerService(relatedListRecordActionsService);ldsCache.registerService(recordAvatarService);ldsCache.registerService(recordAvatarBulkService);ldsCache.registerService(recordService);ldsCache.registerService(recordDefaultsService);ldsCache.registerService(recordFormService);ldsCache.registerService(recordLayoutService);ldsCache.registerService(recordUiService);ldsCache.registerService(flexipageService);// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Apex
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exports.
    // Apex wire adapters are registered in salesforce-scoped-module-resolver lwc module. Therefore we just expose the methods
    // to generate the wire adapters and don't actually register them here.
    const apexWireAdapterGenerator=new ApexWireAdapterGenerator(apexService);const getApexInvoker=apexWireAdapterGenerator.getApexInvoker.bind(apexWireAdapterGenerator);const generateGetApexWireAdapter=apexWireAdapterGenerator.generateGetApexWireAdapter.bind(apexWireAdapterGenerator);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Form Ui
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const formUiWireAdapterGenerator=new FormUiWireAdapterGenerator(formUiService);wireService.register(getFormSectionUi,formUiWireAdapterGenerator.generateGetFormSectionUiWireAdapter());// TODO W-4846954 - do not export getFormSectionUiObservable that returns an observable
    const getFormSectionUiObservable=formUiService.getFormSectionUi.bind(formUiService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Layout
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exports.
    // TODO W-4846954 - do not export getLayout that returns an observable
    const getLayout=layoutService.getLayout.bind(layoutService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Layout User State
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exports.
    const updateLayoutUserState=layoutUserStateService.updateLayoutUserState.bind(layoutUserStateService);// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // List Ui
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const listUiWireAdapterGenerator=new ListUiWireAdapterGenerator(listUiService);wireService.register(getListUi,listUiWireAdapterGenerator.generateGetListUiWireAdapter());const saveSort=listUiService.saveSort.bind(listUiService);const saveColumnWidths=listUiService.saveColumnWidths.bind(listUiService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Lookup Actions
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const lookupActionsWireAdapterGenerator=new LookupActionsWireAdapterGenerator(lookupActionsService);wireService.register(getLookupActions,lookupActionsWireAdapterGenerator.generateGetLookupActionsWireAdapter());// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Actions
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordActionsWireAdapterGenerator=new RecordActionsWireAdapterGenerator(recordActionsService);wireService.register(getRecordActions,recordActionsWireAdapterGenerator.generateGetRecordActionsWireAdapter());// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Relatedlist Record Actions
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const relatedListRecordActionsWireAdapterGenerator=new RelatedListRecordActionsWireAdapterGenerator(relatedListRecordActionsService);wireService.register(getRelatedListRecordActions,relatedListRecordActionsWireAdapterGenerator.generateGetRelatedListRecordActionsWireAdapter());// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Lookup Records
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const lookupRecordsWireAdapterGenerator=new LookupRecordsWireAdapterGenerator(lookupRecordsService);wireService.register(getLookupRecords,lookupRecordsWireAdapterGenerator.generateGetLookupRecordsWireAdapter());// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Object Info
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const objectInfoWireAdapterGenerator=new ObjectInfoWireAdapterGenerator(objectInfoService);wireService.register(getObjectInfo,objectInfoWireAdapterGenerator.generateGetObjectInfoWireAdapter());// TODO W-4846954 - do not export *Observable methods.
    const getObjectInfoObservable=objectInfoService.getObjectInfo.bind(objectInfoService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Picklist values
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const picklistValuesWireAdapterGenerator=new PicklistValuesWireAdapterGenerator(picklistValuesService);wireService.register(getPicklistValues,picklistValuesWireAdapterGenerator.generateGetPicklistValuesWireAdapter());// TODO W-4846954 - do not export *Observable methods.
    const getPicklistValuesObservable=picklistValuesService.getPicklistValues.bind(picklistValuesService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Picklist values by record type
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const picklistValuesByRecordTypeWireAdapterGenerator=new PicklistValuesByRecordTypeWireAdapterGenerator(picklistValuesByRecordTypeService);wireService.register(getPicklistValuesByRecordType,picklistValuesByRecordTypeWireAdapterGenerator.generateGetPicklistValuesByRecordTypeWireAdapter());// TODO W-4846954 - do not export *Observable methods.
    const getPicklistValuesByRecordTypeObservable=picklistValuesByRecordTypeService.getPicklistValuesByRecordType.bind(picklistValuesByRecordTypeService);// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordWireAdapterGenerator=new RecordWireAdapterGenerator(recordService);wireService.register(getRecord,recordWireAdapterGenerator.generateGetRecordWireAdapter());// TODO W-4846954 - do not export getRecordWithFieldsObservable that returns an observable
    const getRecordWithFieldsObservable=recordService.getRecordWithFields.bind(recordService);const createRecord=recordService.createRecord.bind(recordService);const updateRecord=recordService.updateRecord.bind(recordService);const deleteRecord=recordService.deleteRecord.bind(recordService);const getRecordInput=recordServiceUtils.getRecordInput.bind(recordServiceUtils);const generateRecordInputForCreate=recordServiceUtils.generateRecordInputForCreate.bind(recordServiceUtils);const generateRecordInputForUpdate=recordServiceUtils.generateRecordInputForUpdate.bind(recordServiceUtils);const createRecordInputFilteredByEditedFields=recordServiceUtils.createRecordInputFilteredByEditedFields.bind(recordServiceUtils);const recursivelyGatherFieldNames=recordServiceUtils.recursivelyGatherFieldNames.bind(recordServiceUtils);const getFieldValue=recordServiceUtils.getFieldValue.bind(recordServiceUtils);const getFieldDisplayValue=recordServiceUtils.getFieldDisplayValue.bind(recordServiceUtils);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Avatar
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordAvatarWireAdapterGenerator=new RecordAvatarBulkWireAdapterGenerator(recordAvatarBulkService);wireService.register(getRecordAvatars,recordAvatarWireAdapterGenerator.generateGetRecordAvatarsWireAdapter());// TODO W-4846954 - do not export getRecordAvatarsObservable that returns an observable
    const getRecordAvatarsObservable=recordAvatarBulkService.getRecordAvatars.bind(recordAvatarBulkService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Create Defaults
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordDefaultsWireAdapterGenerator=new RecordDefaultsWireAdapterGenerator(recordDefaultsService);wireService.register(getRecordCreateDefaults,recordDefaultsWireAdapterGenerator.generateGetRecordCreateDefaultsWireAdapter());// TODO W-4846954 - do not export getRecordCreateDefaultsObservable that returns an observable
    const getRecordCreateDefaultsObservable=recordDefaultsService.getRecordCreateDefaults.bind(recordDefaultsService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Edit Actions
    // //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordEditActionsWireAdapterGenerator=new RecordEditActionsWireAdapterGenerator(recordEditActionsService);wireService.register(getRecordEditActions,recordEditActionsWireAdapterGenerator.generateGetRecordEditActionsWireAdapter());// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Form
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Exports.
    const getFormSectionComponent=recordFormService.getFormSectionComponent.bind(recordFormService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Layout
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordLayoutWireAdapterGenerator=new RecordLayoutWireAdapterGenerator(recordLayoutService);wireService.register(getRecordLayoutTemplate,recordLayoutWireAdapterGenerator.generateGetRecordLayoutTemplateWireAdapter());const getLayoutTemplateDescriptor=recordLayoutService.getLayoutTemplateDescriptor.bind(recordLayoutService);// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Record Ui
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const recordUiWireAdapterGenerator=new RecordUiWireAdapterGenerator(recordUiService);wireService.register(getRecordUi,recordUiWireAdapterGenerator.generateGetRecordUiWireAdapter());// TODO W-4846954 - do not export getRecordUiObservable that returns an observable
    const getRecordUiObservable=recordUiService.getRecordUi.bind(recordUiService);// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Flexipages
    // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wire adapter.
    const flexipageWireAdapterGenerator=new FlexipageWireAdapterGenerator(flexipageService);wireService.register(getFlexipageTemplate,flexipageWireAdapterGenerator.generateGetFlexipageTemplateWireAdapter());// ////////////////////////

    exports.ldsCacheReferenceForTestingOnly = ldsCache;
    exports.adsBridge = adsBridge;
    exports.getApexInvoker = getApexInvoker;
    exports.generateGetApexWireAdapter = generateGetApexWireAdapter;
    exports.getFormSectionUi = getFormSectionUi;
    exports.getFormSectionUiObservable = getFormSectionUiObservable;
    exports.getLayout = getLayout;
    exports.updateLayoutUserState = updateLayoutUserState;
    exports.getListUi = getListUi;
    exports.saveSort = saveSort;
    exports.saveColumnWidths = saveColumnWidths;
    exports.getLookupActions = getLookupActions;
    exports.getRecordActions = getRecordActions;
    exports.getRelatedListRecordActions = getRelatedListRecordActions;
    exports.getLookupRecords = getLookupRecords;
    exports.getObjectInfo = getObjectInfo;
    exports.getObjectInfoObservable = getObjectInfoObservable;
    exports.getPicklistValues = getPicklistValues;
    exports.getPicklistValuesObservable = getPicklistValuesObservable;
    exports.getPicklistValuesByRecordType = getPicklistValuesByRecordType;
    exports.getPicklistValuesByRecordTypeObservable = getPicklistValuesByRecordTypeObservable;
    exports.getRecord = getRecord;
    exports.getRecordWithFieldsObservable = getRecordWithFieldsObservable;
    exports.createRecord = createRecord;
    exports.updateRecord = updateRecord;
    exports.deleteRecord = deleteRecord;
    exports.getRecordInput = getRecordInput;
    exports.generateRecordInputForCreate = generateRecordInputForCreate;
    exports.generateRecordInputForUpdate = generateRecordInputForUpdate;
    exports.createRecordInputFilteredByEditedFields = createRecordInputFilteredByEditedFields;
    exports.recursivelyGatherFieldNames = recursivelyGatherFieldNames;
    exports.getFieldValue = getFieldValue;
    exports.getFieldDisplayValue = getFieldDisplayValue;
    exports.getRecordAvatars = getRecordAvatars;
    exports.getRecordAvatarsObservable = getRecordAvatarsObservable;
    exports.getRecordCreateDefaults = getRecordCreateDefaults;
    exports.getRecordCreateDefaultsObservable = getRecordCreateDefaultsObservable;
    exports.getRecordEditActions = getRecordEditActions;
    exports.getFormSectionComponent = getFormSectionComponent;
    exports.getRecordLayoutTemplate = getRecordLayoutTemplate;
    exports.getLayoutTemplateDescriptor = getLayoutTemplateDescriptor;
    exports.getRecordUi = getRecordUi;
    exports.getRecordUiObservable = getRecordUiObservable;
    exports.getFlexipageTemplate = getFlexipageTemplate;
    exports.getSObjectValue = getSObjectValue;
    exports.MRU = MRU;
    exports.refresh = refreshWireAdapter;
    exports.generateWireAdapter = generateWireAdapter;
    exports.generateError = generateError;
    exports.getValueForAura = getValueForAura;
    exports.clone = clone;
    exports.Observable = Observable;

    Object.defineProperty(exports, '__esModule', { value: true });

});
