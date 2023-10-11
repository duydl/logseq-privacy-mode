
import "@logseq/libs";
import CryptoJS from "crypto-js";

const parser = new DOMParser();
const delay = ms => new Promise(res => setTimeout(res, ms));

const settings = [

  {
    key: "hide_options",
    title: "Options for hidden blocks",
    type: "heading",
    default: null
  },
      {
        key: "toggle_hide_show",
        title: "Settings for global button privacy-mode-hideshow",
        type: "enum",
        enumPicker: "radio",
        enumChoices: ["Hide", "Show"],
        default: "Hide",
      },
      {
        key: "hide_tag",
        title: "Tag for your hidden block",
        type: "string",
        description: "Warning: hidden classname could not be used.",
        default: "_hidden"
      },
      {
        key: "hidden_style",
        title: "Preferred style for your hidden block",
        type: "string",
        default: `background-color: black; color: black`
      },
    {
      key: "encrypt_options",
      title: "Options for encrypted blocks",
      type: "heading",
      default: null
    },
        {
          key: "toggle_encrypt_decrypt",
          title: "Settings for global button privacy-mode-encdec",
          type: "enum",
          enumPicker: "radio",
          enumChoices: ["Encrypt", "Decrypt"],
          default: "Encrypt",
        },
        {
          key: "encrypt_tag",
          title: "Tag for your encrypted block",
          type: "string",
          default: "_encrypted"
        },
        {
          key: "unlock_password",
          title: "Password for when decrypting text.",
          description: " ",
          type: "string",
          default: ""
        },
        {
          key: "secret_passphrase",
          title: "Passphrase used in encryption.",
          description: "Warning: Always decrypt all blocks before changing password.",
          type: "string",
          default: ""
        },
  
];



const main = () => {

  logseq.useSettingsSchema(settings);

  console.log("=== logseq-privacy-mode Plugin Loaded ===")
  
  logseq.App.registerUIItem("toolbar", {
      key: "privacy-mode-settings",
      template:
          `<a data-on-click="get_settings" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.1 15h1.8q.225 0 .388-.188t.112-.412l-.475-2.625q.5-.25.788-.725T14 10q0-.825-.588-1.413T12 8q-.825 0-1.413.588T10 10q0 .575.288 1.05t.787.725L10.6 14.4q-.05.225.113.413T11.1 15Zm.9 6.9q-.175 0-.325-.025t-.3-.075Q8 20.675 6 17.637T4 11.1V6.375q0-.625.363-1.125t.937-.725l6-2.25q.35-.125.7-.125t.7.125l6 2.25q.575.225.938.725T20 6.375V11.1q0 3.5-2 6.538T12.625 21.8q-.15.05-.3.075T12 21.9Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    get_settings(e) {
      logseq.showSettingsUI()
    }
  });

  // == Encrypt Block == //

  logseq.App.registerUIItem("toolbar", {
    key: "privacy-mode-encdec",
    template:
        `<a data-on-click="mass_encrypt_decrypt" class="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.991 0a.883.883 0 0 0-.871.817v3.02a.883.883 0 0 0 .88.884a.883.883 0 0 0 .88-.88V.816A.883.883 0 0 0 11.991 0zm7.705 3.109a.88.88 0 0 0-.521.174L16.8 5.231a.88.88 0 0 0 .559 1.563a.88.88 0 0 0 .56-.2l2.37-1.951a.88.88 0 0 0-.594-1.534zM4.32 3.122a.883.883 0 0 0-.611 1.52l2.37 1.951a.876.876 0 0 0 .56.2v-.002a.88.88 0 0 0 .56-1.56L4.828 3.283a.883.883 0 0 0-.508-.16zm7.66 3.228a5.046 5.046 0 0 0-5.026 5.045v1.488H5.787a.967.967 0 0 0-.965.964v9.189a.967.967 0 0 0 .965.964h12.426a.967.967 0 0 0 .964-.964v-9.19a.967.967 0 0 0-.964-.963h-1.168v-1.488A5.046 5.046 0 0 0 11.98 6.35zm.012 2.893a2.152 2.152 0 0 1 2.16 2.152v1.488H9.847v-1.488a2.152 2.152 0 0 1 2.145-2.152zm7.382.503a.883.883 0 1 0 .07 1.763h3.027a.883.883 0 0 0 0-1.76h-3.027a.883.883 0 0 0-.07-.003zM1.529 9.75a.883.883 0 0 0 0 1.76h2.999a.883.883 0 0 0 0-1.76zm10.46 6.774a1.28 1.28 0 0 1 .64 2.393v1.245a.63.63 0 0 1-1.259 0v-1.245a1.28 1.28 0 0 1 .619-2.393z"/></svg>
        </a>`
  });
  
  logseq.provideModel({
    async mass_encrypt_decrypt(e) {
      if (logseq.settings?.toggle_encrypt_decrypt == "Encrypt") {

        const query = ` [:find (pull ?h [*])
        :in $ 
        :where
        [?p :block/name "${logseq.settings?.encrypt_tag}"]
        [?h :block/refs ?p]] `
      
        const result = await logseq.DB.datascriptQuery(query) 
        console.log(result)
        for (const item in result) {
          console.log(result[item])
          encrypt(result[item][0].uuid)
        }
      } else if (logseq.settings?.toggle_encrypt_decrypt == "Decrypt") {

        logseq.showMainUI()

        await waitForSubmitClick(); 
        
        const enteredPassword = passwordInput.value;
        passwordInput.value = "";
        
        logseq.hideMainUI()

        if (enteredPassword != logseq.settings?.unlock_password) {return}

        const query = ` [:find (pull ?h [*])
        :in $ 
        :where
        [?p :block/name "${logseq.settings?.encrypt_tag}"]
        [?h :block/refs ?p]] `
      
        const result = await logseq.DB.datascriptQuery(query) 
        console.log(result)
        for (const item in result) {
          console.log(result[item])
          decrypt(result[item][0].uuid)
      }
    }
  }});


  logseq.Editor.registerSlashCommand(
    "Add Private Block: Encrypt",
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()
      logseq.Editor.updateBlock(uuid, `${content} {{renderer privacymode, encrypt}} #${logseq.settings?.encrypt_tag} `)
    },
  )


  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, state] = payload.arguments
    if (type == "privacymode") {
      if (state == "encrypt") {
      
        return logseq.provideUI({
          key: type + payload.uuid,
          slot, 
          template: `<a
          data-on-click="encrypt_private_block"
          data-id-toadd="${logseq.settings?.idToadd}"
          data-slot-id="${slot}"
          data-block-uuid="${payload.uuid}"
          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 20V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h9V6a3 3 0 0 0-3-3a3 3 0 0 0-3 3H7a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2h1m-6 9a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2Z"/></svg></a>`,
        })}
        else if (state == "decrypt") {
          return logseq.provideUI({
            key: type + payload.uuid,
            slot, 
            template: `<a
            data-on-click="decrypt_private_block"
            data-id-toadd="${logseq.settings?.idToadd}"
            data-slot-id="${slot}"
            data-block-uuid="${payload.uuid}"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/></svg></a>`,
          })
        }
    }
  });

  logseq.provideModel({
    async encrypt_private_block(e) {

      // await logseq.Editor.exitEditingMode()
      // await delay(500);
      // await logseq.Editor.exitEditingMode()
      // window.dispatchEvent(
      //   new KeyboardEvent("keydown", {
      //     altKey: false,
      //     code: "Escape",
      //     ctrlKey: false,
      //     isComposing: false,
      //     key: "Escape",
      //     location: 0,
      //     metaKey: false,
      //     repeat: false,
      //     shiftKey: false,
      //     which: 27,
      //     charCode: 0,
      //     keyCode: 27,
      //   })
      // );

      const blockUuid  = e.dataset.blockUuid;
      const block = await logseq.Editor.getBlock(blockUuid);

      const flag = `{{renderer privacymode, encrypt}}`
      const newContent = block?.content?.replace(`${flag}`,
        `{{renderer privacymode, decrypt}}`);
      logseq.Editor.updateBlock(blockUuid, newContent? newContent : "")

      encrypt(blockUuid)  
     
    },
  });


  logseq.provideModel({
    async decrypt_private_block(e) {
      logseq.showMainUI()

      await waitForSubmitClick(); 
      
      const enteredPassword = passwordInput.value;
      passwordInput.value = "";
      
      logseq.hideMainUI()

      if (enteredPassword != logseq.settings?.unlock_password) {return}

      const blockUuid  = e.dataset.blockUuid;
      const block = await logseq.Editor.getBlock(blockUuid);

      const flag = `{{renderer privacymode, decrypt}}`
      const newContent = block?.content?.replace(`${flag}`,
        `{{renderer privacymode, encrypt}}`);
      logseq.Editor.updateBlock(blockUuid, newContent? newContent : "")

      decrypt(blockUuid)
      
    },
  });


// == Hide Block == //


  logseq.provideStyle({
    style: `
    .${logseq.settings?.hide_tag} {${logseq.settings?.hidden_style}};
    `
  })
  console.log(`.${logseq.settings?.hide_tag} {${logseq.settings?.hidden_style}};`)

  logseq.App.registerUIItem("toolbar", {
      key: "privacy-mode-hideshow",
      template:
          `<a data-on-click="hide_show_all" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.8 17v-1.5c0-1.4-1.4-2.5-2.8-2.5s-2.8 1.1-2.8 2.5V17c-.6 0-1.2.6-1.2 1.2v3.5c0 .7.6 1.3 1.2 1.3h5.5c.7 0 1.3-.6 1.3-1.2v-3.5c0-.7-.6-1.3-1.2-1.3m-1.3 0h-3v-1.5c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3V17M15 12c-.9.7-1.5 1.6-1.7 2.7c-.4.2-.8.3-1.3.3c-1.7 0-3-1.3-3-3s1.3-3 3-3s3 1.3 3 3m-3 7.5c-5 0-9.3-3.1-11-7.5c1.7-4.4 6-7.5 11-7.5s9.3 3.1 11 7.5c-.2.5-.5 1-.7 1.5C21.5 12 19.8 11 18 11c-.4 0-.7.1-1.1.1C16.5 8.8 14.5 7 12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5h.3c-.2.4-.3.8-.3 1.2v1.3Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    async hide_show_all(e) {
    if (logseq.settings?.toggle_hide_show == "Hide") {
      const query = ` [:find (pull ?h [*])
      :in $ 
      :where
      [?p :block/name "${logseq.settings?.hide_tag}"]
      [?h :block/refs ?p]] `
    
      const result = await logseq.DB.datascriptQuery(query) 
      console.log(result)
      for (const item in result) {
        console.log(result[item])
        hide(result[item][0].uuid)

      }
    }
     else if (logseq.settings?.toggle_hide_show == "Show") {
      const query = ` [:find (pull ?h [*])
      :in $ 
      :where
      [?p :block/name "${logseq.settings?.hide_tag}"]
      [?h :block/refs ?p]] `
    
      const result = await logseq.DB.datascriptQuery(query) 
      console.log(result)
      for (const item in result) {
        console.log(result[item])
        show(result[item][0].uuid)
    }
  }
  }});


  logseq.Editor.registerSlashCommand(
    "Add Private Block: Hide",
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()
      logseq.Editor.updateBlock(uuid, `<div class="${logseq.settings?.hide_tag}">${content}</div> {{renderer privacymode, hide}}  #${logseq.settings?.hide_tag}`)
    },
  )

  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, state] = payload.arguments
    if (type == "privacymode") {
      if (state == "hide") {
      
        return logseq.provideUI({
          key: type + payload.uuid,
          slot, 
          template: `<a
          data-on-click="hide_private_block"
          data-hide-tag="${logseq.settings?.hide_tag}"
          data-slot-id="${slot}"
          data-block-uuid="${payload.uuid}"
          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"/></svg></a>`,
        })}
        else if (state == "show"){
          return logseq.provideUI({
            key: type + payload.uuid,
            slot, 
            template: `<a
            data-on-click="show_private_block"
            data-hide-tag="${logseq.settings?.hide_tag}"
            data-slot-id="${slot}"
            data-block-uuid="${payload.uuid}"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.073 12.194L4.212 8.333c-1.52 1.657-2.096 3.317-2.106 3.351L2 12l.105.316C2.127 12.383 4.421 19 12.054 19c.929 0 1.775-.102 2.552-.273l-2.746-2.746a3.987 3.987 0 0 1-3.787-3.787zM12.054 5c-1.855 0-3.375.404-4.642.998L3.707 2.293L2.293 3.707l18 18l1.414-1.414l-3.298-3.298c2.638-1.953 3.579-4.637 3.593-4.679l.105-.316l-.105-.316C21.98 11.617 19.687 5 12.054 5zm1.906 7.546c.187-.677.028-1.439-.492-1.96s-1.283-.679-1.96-.492L10 8.586A3.955 3.955 0 0 1 12.054 8c2.206 0 4 1.794 4 4a3.94 3.94 0 0 1-.587 2.053l-1.507-1.507z"/></svg></a>`,
          })
        }
    }
  });

  logseq.provideModel({
    async hide_private_block(e) {

      const blockUuid  = e.dataset.blockUuid;
      const block = await logseq.Editor.getBlock(blockUuid);

      const flag = `{{renderer privacymode, hide}}`
      const newContent = block?.content?.replace(`${flag}`,
        `{{renderer privacymode, show}}`);
      console.log(newContent)
      await logseq.Editor.updateBlock(blockUuid, newContent? newContent : "")

      hide(blockUuid)  
    },
  });


  logseq.provideModel({
    async show_private_block(e) {

      const blockUuid  = e.dataset.blockUuid;
      const block = await logseq.Editor.getBlock(blockUuid);

      const flag = `{{renderer privacymode, show}}`
      const newContent = block?.content?.replace(`${flag}`,
        `{{renderer privacymode, hide}}`);
      console.log(newContent)
      await logseq.Editor.updateBlock(blockUuid, newContent? newContent : "")
          
      show(blockUuid)
    },
  });

}
logseq.ready(main).catch(console.error)

// document.addEventListener(
//   "keydown",
//   (e)=>{console.log("Check for keypress:", e)}
// );

const passwordInput = document.getElementById("passwordInput");

async function waitForSubmitClick() {
  return new Promise((resolve) => {
    const submitButton = document.getElementById("submitButton");

    submitButton.addEventListener("click", () => {
      resolve(); 
    });
  });
}


async function encrypt (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    const childUuid = childElement.uuid
    let encrypted = await logseq.Editor.getBlockProperty(childUuid, "encrypted")
    
    if (!encrypted) {

      let [properties, content] = procContent(childElement.content)

      const checkEditing = await logseq.Editor.checkEditing()

      if (content && checkEditing!=childUuid) {

        const password = logseq.settings?.secret_passphrase
        if (!password) {
        // if (true) {
          logseq.Editor.updateBlock(childUuid, btoa(content))
        }
        else {
          logseq.Editor.updateBlock(childUuid, CryptoJS.AES.encrypt(content, password).toString())
        }

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childUuid), key, value)

          
        });
        logseq.Editor.upsertBlockProperty((childUuid), "encrypted", true)
        }
      
      }
    encrypt(childUuid)
  };
}


async function decrypt (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {

    const childUuid = childElement.uuid
    let encrypted = await logseq.Editor.getBlockProperty(childUuid, "encrypted")
    
    if (encrypted && encrypted == true) {

      let [properties, content] = procContent(childElement.content)
      const checkEditing = await logseq.Editor.checkEditing()

      if (content && checkEditing!=childUuid) {
        const password = logseq.settings?.secret_passphrase
        if (!password) {
        // if (true) {
          logseq.Editor.updateBlock(childUuid, atob(content))
        }
        else {
           logseq.Editor.updateBlock(childUuid, CryptoJS.AES.decrypt(content, password).toString(CryptoJS.enc.Utf8))
        }

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childUuid), key, value)
        });
        
        logseq.Editor.upsertBlockProperty((childUuid), "encrypted", false)
      }
      
      
      }
    decrypt(childUuid)
  };
}


async function hide (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    const childUuid = childElement.uuid
    
    let hidden = await logseq.Editor.getBlockProperty(childUuid, "hidden")

    if (!hidden) {

      let [properties, content] = procContent(childElement.content)
      const checkEditing = await logseq.Editor.checkEditing()

      if (content && checkEditing!=childUuid) {
        logseq.Editor.updateBlock(childUuid, `<div class="${logseq.settings?.hide_tag}">${content}</div>`)

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childUuid), key, value)
        });
        logseq.Editor.upsertBlockProperty((childUuid), "hidden", true)
       }
       
      }
    hide(childUuid)
  };
}


async function show (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    const childUuid = childElement.uuid

    let hidden = await logseq.Editor.getBlockProperty(childUuid, "hidden")

    if (hidden && hidden == true) {

      let [properties, content] = procContent(childElement.content)
      const checkEditing = await logseq.Editor.checkEditing()

      if (content && checkEditing!=childUuid) {
        const htmlString = content
        const doc = parser.parseFromString(htmlString, "text/html");
        const divElement = doc.querySelector("div");
        logseq.Editor.updateBlock(childUuid, divElement?.textContent)

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childUuid), key, value)
        });
        logseq.Editor.upsertBlockProperty((childUuid), "hidden", false)
        }
        
      }
    show(childUuid)
  };
}


function procContent(inputString) {
  const lines = inputString.split("\n");
  const resultObject = {};
  const filteredLines = lines.filter((line) => !line.includes("::"));

  const filteredtagLines = lines.filter((line) => line.includes("::"));

  // Join the filtered lines back into a single string
  const resultString = filteredLines.join("\n");

  if (filteredtagLines.length > 0){
    filteredtagLines.forEach((line) => {
      // Split the line by "::"
      let part = line.split("::")
      let property = part[0].trim();
      let value = part.slice(1).join("::");
      resultObject[property] = value;
    })
  } 

  return [resultObject, resultString];
}