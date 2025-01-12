  /**
  * This module setups the serve.sh file.
  * @module
  */

  import packageConfig from "../deno.json" with {type: "json"}; 
    
  export const setupServeSh = async () => {
    const fileResponse = await fetch(`https://jsr.io/@nguvu/cloud/${packageConfig.version}/templates/serve.sh`);
  
    if (fileResponse.body) {
      const file = await Deno.open("/serve.sh", { write: true, create: true });
     
      await fileResponse.body.pipeTo(file.writable);
     
    }
    
  }
 
  