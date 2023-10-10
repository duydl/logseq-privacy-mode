
import "@logseq/libs";
import CryptoJS from "crypto-js";

const parser = new DOMParser();

const settings = [
    {
        key: "encrypt",
        title: "Preferred name for your private block",
        type: "boolean",
        default: true
    },
    {
      key: "hide",
      title: "Preferred name for your private block",
      type: "boolean",
      default: true
    },
    {
      key: "idToadd",
      title: "Preferred name for your private block",
      type: "string",
      default: "private"
  },
  {
    key: "styleOfBlock0",
    title: "Preferred style for your private block",
    type: "string",
    default: `#private {
      background-color: var(--ls-primary-text-color);
     }`
  },
  {
    key: "styleOfBlock1",
    title: "Preferred style for your private block",
    type: "string",
    default: `#private {
      background-color: var(--color-level-1);
     }`
  },
  
];



const main = () => {


  // == Encrypt Block == //

  const query = ` [:find (pull ?h [*])
    :in $ 
    :where
    [?p :block/name "private"]
    [?h :block/refs ?p]] `
    
    // `[:find (pull ?p[*]) 
    // :in $ 
    // :where [?pin :block/name "mypage"] 
    //   [?b :block/refs ?pin] 
    //   [?b :block/page ?p]]`
  
  logseq.DB.datascriptQuery(query).then(result => console.log(result))

  console.log('=== logseq-privacy-mode Plugin Loaded ===')
  logseq.useSettingsSchema(settings);
  logseq.App.queryElementById("app-container").then(result => console.log(result))

  // toolbar icon
  logseq.App.registerUIItem("toolbar", {
      key: "logseg-encrypt",
      template:
          `<a data-on-click="change_encrypting_mode" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.1 15h1.8q.225 0 .388-.188t.112-.412l-.475-2.625q.5-.25.788-.725T14 10q0-.825-.588-1.413T12 8q-.825 0-1.413.588T10 10q0 .575.288 1.05t.787.725L10.6 14.4q-.05.225.113.413T11.1 15Zm.9 6.9q-.175 0-.325-.025t-.3-.075Q8 20.675 6 17.637T4 11.1V6.375q0-.625.363-1.125t.937-.725l6-2.25q.35-.125.7-.125t.7.125l6 2.25q.575.225.938.725T20 6.375V11.1q0 3.5-2 6.538T12.625 21.8q-.15.05-.3.075T12 21.9Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    change_encrypting_mode(e) {

      if (logseq.settings.encrypt) {
        logseq.updateSettings({"encrypt": false,})
        logseq.UI.showMsg("Encrypt False")
      }
      else {
        logseq.updateSettings({"encrypt": true,})
        logseq.UI.showMsg("Encrypt True")
      }
    }
  });

  logseq.App.registerUIItem("toolbar", {
    key: "logseg-mass-decrypt",
    template:
        `<a data-on-click="mass_decrypt" class="button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16 20V10H4v10h12m0-12c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2h9V6c0-1.7-1.3-3-3-3S7 4.3 7 6H5c0-2.8 2.2-5 5-5s5 2.2 5 5v2h1m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M22 7h-2v6h2V7m0 8h-2v2h2v-2Z"/></svg>
        </a>`
  });

  logseq.provideModel({
    async mass_decrypt(e) {

    const query = ` [:find (pull ?h [*])
    :in $ 
    :where
    [?p :block/name "private"]
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
      logseq.Editor.updateBlock(uuid, `{{renderer privacymode_encrypt, default}} #private `)
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

  logseq.App.registerUIItem("toolbar", {
      key: "logseg-privacy-block",
      template:
          `<a data-on-click="change_styles_private_block" class="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3h-.17m-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7Z"/></svg>
          </a>`
  });

  logseq.provideModel({
    change_styles_private_block(e) {

      if (theCurrentStyle == 1) {
        theCurrentStyle = 0
        logseq.provideStyle({
          style: `
          ${logseq.settings?.styleOfBlock0}
          `,
        })
      } else {
        theCurrentStyle = 1
        logseq.provideStyle({
          style: `
          ${logseq.settings?.styleOfBlock1}
          `,
        })
      }
    },
  });


  logseq.Editor.registerSlashCommand(
    'Add Private Block: Hide',
    async () => {
      const { content, uuid } = await logseq.Editor.getCurrentBlock()
      logseq.Editor.updateBlock(uuid, `<div id="${logseq.settings?.idToadd}">${content}</div> {{renderer privacymode_hide, ${logseq.settings?.idToadd}}}  #${logseq.settings?.idToadd}`)
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
          data-id-toadd="${logseq.settings?.idToadd}"
          data-slot-id="${slot}"
          data-block-uuid="${payload.uuid}"
          data-scheme-id=${scheme}"
          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.073 12.194L4.212 8.333c-1.52 1.657-2.096 3.317-2.106 3.351L2 12l.105.316C2.127 12.383 4.421 19 12.054 19c.929 0 1.775-.102 2.552-.273l-2.746-2.746a3.987 3.987 0 0 1-3.787-3.787zM12.054 5c-1.855 0-3.375.404-4.642.998L3.707 2.293L2.293 3.707l18 18l1.414-1.414l-3.298-3.298c2.638-1.953 3.579-4.637 3.593-4.679l.105-.316l-.105-.316C21.98 11.617 19.687 5 12.054 5zm1.906 7.546c.187-.677.028-1.439-.492-1.96s-1.283-.679-1.96-.492L10 8.586A3.955 3.955 0 0 1 12.054 8c2.206 0 4 1.794 4 4a3.94 3.94 0 0 1-.587 2.053l-1.507-1.507z"/></svg></a>`,
        })}
        else {
          return logseq.provideUI({
            key: type + payload.uuid,
            slot, 
            template: `<a
            data-on-click="show_private_block"
            data-id-toadd="${logseq.settings?.idToadd}"
            data-slot-id="${slot}"
            data-block-uuid="${payload.uuid}"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z"/></svg></a>`,
          })
        }
    }
  });

  logseq.provideModel({
    async hide_private_block(e) {
      hide(e.dataset.blockUuid, e.dataset.schemeId)  
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
        logseq.Editor.updateBlock(childElement.uuid, CryptoJS.AES.encrypt(content, "password").toString())

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
        logseq.Editor.updateBlock(childElement.uuid, CryptoJS.AES.decrypt(content, "password").toString(CryptoJS.enc.Utf8))

        Object.entries(properties).forEach(([key, value]) => {
          logseq.Editor.upsertBlockProperty((childElement.uuid), key, value)
        });

        logseq.Editor.upsertBlockProperty((childElement.uuid), "encrypted", false)}
      }
    decrypt(childElement.uuid)
  };
}


async function hide (blockUuid, scheme){
  const blocks = await logseq.Editor.getBlock(blockUuid, {
    includeChildren: true
  })
  for (const childElement of blocks?.children) {
    let hidden = await logseq.Editor.getBlockProperty(childElement.uuid, "hidden")

    if (!hidden) {

      let [properties, content] = procContent(childElement.content)

      if (content) {
        logseq.Editor.updateBlock(childElement.uuid, `<div id="${scheme}">${content}</div>`)

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