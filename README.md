# Logseq Privacy Mode plugin


## Overview
A little plugin that offers some privacy options for your Logseq notes. With this plugin, you can easily hide or encrypt specific blocks of text under the blocks with specific tags.

### Usage
- Hide sensitive information when screen sharing i.e live streaming. 
- Encrypt information into unreadable format. Require unlock password to decrypt. 
- The commands could be run with either global buttons on toolbar that affect the whole graph or block buttons rendered with macro that only affect the child blocks.
## Features


### 1. Slash Commands

You could quickly start using the plugin with the slash commands: "Add private block: encrypt" and "Add private block: hide." These automatically add the tags for encrypted or hidden block as well as create buttons which, when clicked will toggle the encryption or visibility state of local child blocks.

![Alt text](screenshots/demo3.gif)


### 2. Global buttons

The toolbar buttons allow changing the state of all blocks in the graph with the specified tags. 


![Alt text](screenshots/demo1.gif)

![Alt text](screenshots/demo2.gif)

Unlike the embedded buttons, these only do one thing at time, such as decrypt or show all items. What they do (decrypt/encrypt) is defined in the settings.

You could define the tag to mark the blocks to hide as well as style of the hidden blocks in the setting.  

### Notes 

- **Exit editing mode when running the commands**. Otherwise the edited block will be not be updated.
- **Decrypt all block before changing secret passphrase**.  


## Future Enhancement

- Support for hiding parent block
- Decryption test at the password prompt 
- Simple API to sync encrypted text to cloud
- Style selections for hidden blocks
  
## License