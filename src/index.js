
import "@logseq/libs";
import CryptoJS from "crypto-js";

const parser = new DOMParser();

const settings = [
  {
    key: "encrypt_options",
    title: "Options for encrypted blocks",
    type: "heading",
    default: null
  },
      {
        key: "encrypt",
        description: "Encrypt/Decrypt",
        type: "boolean",
        default: true
      },
      {
        key: "encrypt_tag",
        title: "Tag for your encrypted block",
        type: "string",
        default: ""
      },
      // {
      //   key: "encrypt_tag",
      //   title: "Password for encryption.",
      //   description: "Warning: Changing password would break your content when decrypt. ",
      //   type: "string",
      //   default: ""
      // },
  {
    key: "hide_options",
    title: "Options for hidden blocks",
    type: "heading",
    default: null
  },
      {
        key: "hide",
        description: "Hide/Show",
        type: "boolean",
        default: true
      },
      {
        key: "hide_tag",
        title: "Tag for your hidden block",
        type: "string",
        default: ""
      },
      {
        key: "hidden_style",
        title: "Preferred style for your hidden block",
        type: "string",
        default: `background-color: black; color: black`
      },
  
];



const main = () => {

  logseq.useSettingsSchema(settings);

  console.log('=== logseq-privacy-mode Plugin Loaded ===')
  
  logseq.App.registerUIItem("toolbar", {
      key: "logseg-privacy-mode-settings",
      template:
          `<a data-on-click="show_settings" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.1 15h1.8q.225 0 .388-.188t.112-.412l-.475-2.625q.5-.25.788-.725T14 10q0-.825-.588-1.413T12 8q-.825 0-1.413.588T10 10q0 .575.288 1.05t.787.725L10.6 14.4q-.05.225.113.413T11.1 15Zm.9 6.9q-.175 0-.325-.025t-.3-.075Q8 20.675 6 17.637T4 11.1V6.375q0-.625.363-1.125t.937-.725l6-2.25q.35-.125.7-.125t.7.125l6 2.25q.575.225.938.725T20 6.375V11.1q0 3.5-2 6.538T12.625 21.8q-.15.05-.3.075T12 21.9Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    show_settings(e) {
      logseq.showSettingsUI()
      // if (logseq.settings.encrypt) {
      //   logseq.updateSettings({"encrypt": false,})
      //   logseq.UI.showMsg("Encrypt False")
      // }
      // else {
      //   logseq.updateSettings({"encrypt": true,})
      //   logseq.UI.showMsg("Encrypt True")
      // }
    }
  });

  // == Encrypt Block == //

  logseq.App.registerUIItem("toolbar", {
    key: "logseg-mass-decrypt",
    template:
        `<a data-on-click="mass_decrypt" class="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.991 0a.883.883 0 0 0-.871.817v3.02a.883.883 0 0 0 .88.884a.883.883 0 0 0 .88-.88V.816A.883.883 0 0 0 11.991 0zm7.705 3.109a.88.88 0 0 0-.521.174L16.8 5.231a.88.88 0 0 0 .559 1.563a.88.88 0 0 0 .56-.2l2.37-1.951a.88.88 0 0 0-.594-1.534zM4.32 3.122a.883.883 0 0 0-.611 1.52l2.37 1.951a.876.876 0 0 0 .56.2v-.002a.88.88 0 0 0 .56-1.56L4.828 3.283a.883.883 0 0 0-.508-.16zm7.66 3.228a5.046 5.046 0 0 0-5.026 5.045v1.488H5.787a.967.967 0 0 0-.965.964v9.189a.967.967 0 0 0 .965.964h12.426a.967.967 0 0 0 .964-.964v-9.19a.967.967 0 0 0-.964-.963h-1.168v-1.488A5.046 5.046 0 0 0 11.98 6.35zm.012 2.893a2.152 2.152 0 0 1 2.16 2.152v1.488H9.847v-1.488a2.152 2.152 0 0 1 2.145-2.152zm7.382.503a.883.883 0 1 0 .07 1.763h3.027a.883.883 0 0 0 0-1.76h-3.027a.883.883 0 0 0-.07-.003zM1.529 9.75a.883.883 0 0 0 0 1.76h2.999a.883.883 0 0 0 0-1.76zm10.46 6.774a1.28 1.28 0 0 1 .64 2.393v1.245a.63.63 0 0 1-1.259 0v-1.245a1.28 1.28 0 0 1 .619-2.393z"/></svg>
        </a>`
  });

  logseq.provideModel({
    async mass_decrypt(e) {

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
  }});


  logseq.Editor.registerSlashCommand(
    'Add Private Block: Encrypt',
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()
      logseq.Editor.updateBlock(uuid, `{{renderer privacymode_encrypt, default}} #${logseq.settings.encrypt_tag} `)
    },
  )


  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, scheme] = payload.arguments
    if (type == "privacymode_encrypt") {
      if (logseq.settings.encrypt == true) {
      
        return logseq.provideUI({
          key: type + payload.uuid,
          slot, 
          template: `<a
          data-on-click="encrypt_private_block"
          data-id-toadd="${logseq.settings?.idToadd}"
          data-slot-id="${slot}"
          data-block-uuid="${payload.uuid}"
          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/></svg></a>`,
        })}
        else {
          return logseq.provideUI({
            key: type + payload.uuid,
            slot, 
            template: `<a
            data-on-click="decrypt_private_block"
            data-id-toadd="${logseq.settings?.idToadd}"
            data-slot-id="${slot}"
            data-block-uuid="${payload.uuid}"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 20V10H6v10h12m0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h9V6a3 3 0 0 0-3-3a3 3 0 0 0-3 3H7a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2h1m-6 9a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2Z"/></svg></a>`,
          })
        }
    }
  });

  logseq.provideModel({
    async encrypt_private_block(e) {
      encrypt(e.dataset.blockUuid)  
    },
  });


  logseq.provideModel({
    async decrypt_private_block(e) {
      decrypt(e.dataset.blockUuid)
    },
  });


// == Hide Block == //


  logseq.provideStyle({
    style: `
    #${logseq.settings.hide_tag}: {${logseq.settings.hidden_style};}
    `
  })
  console.log(`#${logseq.settings.hide_tag}: {${logseq.settings.hidden_style}}`)

  logseq.App.registerUIItem("toolbar", {
      key: "logseg-show-all",
      template:
          `<a data-on-click="show_all" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.8 17v-1.5c0-1.4-1.4-2.5-2.8-2.5s-2.8 1.1-2.8 2.5V17c-.6 0-1.2.6-1.2 1.2v3.5c0 .7.6 1.3 1.2 1.3h5.5c.7 0 1.3-.6 1.3-1.2v-3.5c0-.7-.6-1.3-1.2-1.3m-1.3 0h-3v-1.5c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3V17M15 12c-.9.7-1.5 1.6-1.7 2.7c-.4.2-.8.3-1.3.3c-1.7 0-3-1.3-3-3s1.3-3 3-3s3 1.3 3 3m-3 7.5c-5 0-9.3-3.1-11-7.5c1.7-4.4 6-7.5 11-7.5s9.3 3.1 11 7.5c-.2.5-.5 1-.7 1.5C21.5 12 19.8 11 18 11c-.4 0-.7.1-1.1.1C16.5 8.8 14.5 7 12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5h.3c-.2.4-.3.8-.3 1.2v1.3Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    async show_all(e) {

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
  }});


  logseq.Editor.registerSlashCommand(
    'Add Private Block: Hide',
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()
      logseq.Editor.updateBlock(uuid, `<div id="${logseq.settings?.hide_tag}">${content}</div> {{renderer privacymode_hide, default}}  #${logseq.settings?.hide_tag}`)
    },
  )

  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, scheme] = payload.arguments
    if (type == "privacymode_hide") {
      if (logseq.settings.hide == true) {
      
        return logseq.provideUI({
          key: type + payload.uuid,
          slot, 
          template: `<a
          data-on-click="hide_private_block"
          data-hide-tag="${logseq.settings?.hide_tag}"
          data-slot-id="${slot}"
          data-block-uuid="${payload.uuid}"
          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.073 12.194L4.212 8.333c-1.52 1.657-2.096 3.317-2.106 3.351L2 12l.105.316C2.127 12.383 4.421 19 12.054 19c.929 0 1.775-.102 2.552-.273l-2.746-2.746a3.987 3.987 0 0 1-3.787-3.787zM12.054 5c-1.855 0-3.375.404-4.642.998L3.707 2.293L2.293 3.707l18 18l1.414-1.414l-3.298-3.298c2.638-1.953 3.579-4.637 3.593-4.679l.105-.316l-.105-.316C21.98 11.617 19.687 5 12.054 5zm1.906 7.546c.187-.677.028-1.439-.492-1.96s-1.283-.679-1.96-.492L10 8.586A3.955 3.955 0 0 1 12.054 8c2.206 0 4 1.794 4 4a3.94 3.94 0 0 1-.587 2.053l-1.507-1.507z"/></svg></a>`,
        })}
        else {
          return logseq.provideUI({
            key: type + payload.uuid,
            slot, 
            template: `<a
            data-on-click="show_private_block"
            data-hide-tag="${logseq.settings?.hide_tag}"
            data-slot-id="${slot}"
            data-block-uuid="${payload.uuid}"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"/></svg></a>`,
          })
        }
    }
  });

  logseq.provideModel({
    async hide_private_block(e) {
      hide(e.dataset.blockUuid, e.dataset.hideTag)  
    },
  });


  logseq.provideModel({
    async show_private_block(e) {
      show(e.dataset.blockUuid)
    },
  });

}
logseq.ready(main).catch(console.error)






async function encrypt (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    let encrypted = await logseq.Editor.getBlockProperty(childElement.uuid, "encrypted")

    if (!encrypted) {

      let [properties, content] = procContent(childElement.content)

      if (content) {
        // logseq.Editor.updateBlock(childElement.uuid, CryptoJS.AES.encrypt(content, "password").toString())

        logseq.Editor.updateBlock(childElement.uuid, btoa(content))

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childElement.uuid), key, value)
        });

        logseq.Editor.upsertBlockProperty((childElement.uuid), "encrypted", true)}
      }
    encrypt(childElement.uuid)
  };
}


async function decrypt (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    let encrypted = await logseq.Editor.getBlockProperty(childElement.uuid, "encrypted")
    
    if (encrypted && encrypted == true) {

      let [properties, content] = procContent(childElement.content)

      if (content) {
        // logseq.Editor.updateBlock(childElement.uuid, CryptoJS.AES.decrypt(content, "password").toString(CryptoJS.enc.Utf8))

        logseq.Editor.updateBlock(childElement.uuid, atob(content, "password"))

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childElement.uuid), key, value)
        });

        logseq.Editor.upsertBlockProperty((childElement.uuid), "encrypted", false)}
      }
    decrypt(childElement.uuid)
  };
}


async function hide (blockUuid, divId){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    let hidden = await logseq.Editor.getBlockProperty(childElement.uuid, "hidden")

    if (!hidden) {

      let [properties, content] = procContent(childElement.content)

      if (content) {
        logseq.Editor.updateBlock(childElement.uuid, `<div id="${divId}">${content}</div>`)

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childElement.uuid), key, value)
        });

        logseq.Editor.upsertBlockProperty((childElement.uuid), "hidden", true)}
      }
    hide(childElement.uuid)
  };
}


async function show (blockUuid){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    let hidden = await logseq.Editor.getBlockProperty(childElement.uuid, "hidden")

    if (hidden && hidden == true) {

      let [properties, content] = procContent(childElement.content)

      if (content) {
        const htmlString = content
        const doc = parser.parseFromString(htmlString, 'text/html');
        const divElement = doc.querySelector('div');
        logseq.Editor.updateBlock(childElement.uuid, divElement.textContent)

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childElement.uuid), key, value)
        });

        logseq.Editor.upsertBlockProperty((childElement.uuid), "hidden", false)}
      }
    show(childElement.uuid)
  };
}


function procContent(inputString) {
  const lines = inputString.split('\n');
  const resultObject = {};
  const filteredLines = lines.filter((line) => !line.includes('::'));

  const filteredtagLines = lines.filter((line) => line.includes('::'));

  // Join the filtered lines back into a single string
  const resultString = filteredLines.join('\n');

  if (filteredtagLines.length > 0){
    filteredtagLines.forEach((line) => {
      // Split the line by '::'
      let part = line.split('::')
      let property = part[0].trim();
      let value = part.slice(1).join('::');
      resultObject[property] = value;
    })
  } 

  return [resultObject, resultString];
}