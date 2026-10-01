/* tslint:disable */
/* eslint-disable */

export class JsBlindResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly blinded_message: Uint8Array;
    readonly inv_blind_factor: Uint8Array;
    readonly randomizer: Uint8Array | undefined;
}

export class JsRsaBssaPublicKey {
    free(): void;
    [Symbol.dispose](): void;
    blind(msg: Uint8Array): JsBlindResult;
    constructor(n_bytes: Uint8Array, e_bytes: Uint8Array);
    unblind(blind_signature: Uint8Array, blind_result: JsBlindResult, msg: Uint8Array): JsRsaBssaSignature;
}

export class JsRsaBssaSignature {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly signature: Uint8Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_jsblindresult_free: (a: number, b: number) => void;
    readonly __wbg_jsrsabssapublickey_free: (a: number, b: number) => void;
    readonly __wbg_jsrsabssasignature_free: (a: number, b: number) => void;
    readonly jsblindresult_blinded_message: (a: number) => [number, number];
    readonly jsblindresult_inv_blind_factor: (a: number) => [number, number];
    readonly jsblindresult_randomizer: (a: number) => [number, number];
    readonly jsrsabssapublickey_blind: (a: number, b: number, c: number) => [number, number, number];
    readonly jsrsabssapublickey_new: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly jsrsabssapublickey_unblind: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly jsrsabssasignature_signature: (a: number) => [number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
