/** Class to create wasm loader from different sources */
class SimpleWasmLoaderBuilder {

    /**
     * Loads WebAssembly Module by fetching it from the server
     * @param {string} filename The Filename which sould be loaded
     * @param {object} importObjects Objects and Functions which can be imported
     * @returns {SimpleWasmLoader}
     */
    static async loadWasm(filename, importObjects = {}) {
        return WebAssembly.instantiateStreaming(fetch(filename), importObjects)
            .then((obj) => {
                let temp = new SimpleWasmLoader();
                temp.name = filename;
                temp.exports = WebAssembly.Module.exports(obj.module);

                temp.module = obj.module;

                let tempObjects = obj.instance.exports;

                temp.exports.forEach((e) => {
                    if(e.kind == "function") {
                        temp.functions[e.name] = tempObjects[e.name];
                    } else if(e.kind == "memory") {
                        temp.memory[e.name] = tempObjects[e.name];
                    }
                });
                return temp;
            });
    }


    /**
     * Compiles WebAssembly Module from a byte-array
     * @param {string} name The Name of the WebAssembly Module
     * @param {Uint8Array} byteArray The Module as Byte Array
     * @param {object} importObjects Objects and Functions which can be imported into the WebAssembly Module
     * @returns {SimpleWasmLoader}
     */
    static loadByteArray(name, byteArray, importObjects = {}) {
        let temp = new SimpleWasmLoader();

        temp.name = name;

        let wasmModule = new WebAssembly.Module(byteArray);

        temp.module = wasmModule;
        temp.exports = WebAssembly.Module.exports(wasmModule);

        let wasmInstance = new WebAssembly.Instance(wasmModule, importObjects);

        let tempObjects = wasmInstance.exports;

        temp.exports.forEach((e) => {
            if(e.kind == "function") {
                temp.functions[e.name] = tempObjects[e.name];
            } else if(e.kind == "memory") {
                temp.memory[e.name] = tempObjects[e.name];
            }
        });

        return temp;
    }
}


/** Class representing WebAssembly File */
class SimpleWasmLoader {

    /**
     * Initilization of all Variables
     */
    constructor () {
        this.name = "";
        this.exports = [];
        this.functions = {};
        this.memory = {};
        this.module;
    }      
    

    /**
     * 
     * @returns {Array} Array with name and kind of all exported objects
     */
    getExports() {
        return this.exports;
    }

    /**
     * 
     * @returns {Array} Array with all exported functions
     */
    getFunctions() {
        return this.functions;
    }

    /**
     * 
     * @returns {Array} Array with exported memory
     */
    getMemory() {
        return this.memory;
    }

    /**
     * 
     * @param {string} functionName The name of the function.
     * @returns {function} 
     */
    getFunction(functionName) {
        return this.getFunctions()[functionName];
    }


}

/**
 * Just the builder class is exported
 */
export {SimpleWasmLoaderBuilder};
