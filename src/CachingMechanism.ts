import { CachingInterface } from "@/interface";

export default class DefaultCachingMechanism<K, V> extends Map implements CachingInterface {
    private _httpCachingMethods: Array<string>;
    set httpCachingMethods( methods: Array<string> ) {
        this._httpCachingMethods = methods;
    }

    get httpCachingMethods(): Array<string> {
        return this._httpCachingMethods;
    }
}