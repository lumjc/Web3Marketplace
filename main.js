/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

Moralis.initialize('l8T3PYmGe5rBWzNswX90jSlbQ9p7kjxpznHHjPBO');
Moralis.serverURL = 'https://t4jve9pvn40e.grandmoralis.com:2053/server';


const TOKEN_CONTRACT_ADDRESS = '0xaB7014fDC49A092F2C22A3F92A94de44A934aba1';
hideElement = (element) => element.style.display = 'none';
showElement = (element) => element.style.display = 'block';

// enable moralis and connect to web3
init = async () => {
  hideElement(userInfo);
  hideElement(createItemForm);
  window.web3 = await Moralis.Web3.enable();
  window.tokenContract = web3.eth.contract(tokenContractAbi).at(TOKEN_CONTRACT_ADDRESS);
  initUser();
};

initUser = async () => {
  if (await Moralis.User.current()) {
    hideElement(userConnectButton);
    showElement(userProfileButton);
    showElement(openCreateItemButton);
  } else {
    showElement(userConnectButton);
    hideElement(userProfileButton);
    hideElement(openCreateItemButton);
  }
};


login = async () => {
  try {
    await Moralis.authenticate();
    console.log('logged in');
    initUser();
  } catch (error) {
    alert(error);
  }
};

async function logOut() {
  await Moralis.User.logOut();
  hideElement(userInfo);
  initUser();
  console.log('logged out');
}

openUserInfo = async () => {
  user = await Moralis.User.current();
  if (user) {
    const email = user.get('email');
    if (email) {
      userEmailField.value = email;
    } else {
      userEmailField.value = '';
    }

    userUsernameField.value = user.get('username');

    const userAvatar = user.get('avatar');
    if (userAvatar) {
      userAvatarImg.src = userAvatar.url();
      showElement(userAvatarImg);
    } else {
      hideElement(userAvatarImg);
    }

    showElement(userInfo);
  } else {
    login();
  }
};

saveUserInfo = async () => {
  user.set('email', userEmailField.value);
  user.set('username', userUsernameField.value);


  if (userAvatarFile.files.length > 0) {
    const avatar = new Moralis.File('avatar.jpeg', userAvatarFile.files[0]);
    user.set('avatar', avatar);
  }

  await user.save();
  alert('user info saved successfully');
  openUserInfo();
};

createItem = async () => {
  if (createItemFile.files.length == 0) {
    alert('please select a file');
    return;
  } else if (createItemNameField.value.length == 0) {
    alert('please give the item a name');
    return;
  }

  const nftFile = new Moralis.File('nftFile.jpeg', createItemFile.files[0]);
  await nftFile.saveIPFS();

  const nftFilePath = nftFile.ipfs();
  const nftFileHash = nftFile.hash();

  const metadata = {
    name: createItemNameField.value,
    description: createItemDescriptionField.value,
    image: nftFilePath,
  };

  const nftFileMetadataFile = new Moralis.File('metadata.json', {base64: btoa(JSON.stringify(metadata))});
  await nftFileMetadataFile.saveIPFS();

  const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
  const nftFileMetadataFileHash = nftFileMetadataFile.hash();

  const nftId = await mintNft(nftFileMetadataFilePath);

  const Item = Moralis.Object.extend('Item');

  const item = new Item();
  item.set('name', createItemNameField.value);
  item.set('description', createItemDescriptionField.value);
  item.set('nftFilePath', nftFilePath);
  item.set('nftFileHash', nftFileHash);
  item.set('MetadataFilePath', nftFileMetadataFilePath);
  item.set('MetadataFileHash', nftFileMetadataFileHash);
  item.set('nftId', nftId);
  item.set('nftContractAddress', TOKEN_CONTRACT_ADDRESS);
  await item.save();
  console.log(item);
};

mintNft = async (metadataUrl) => {
    console.log(mintNft)
    const receipt = await tokenContract.methods.createItem(metadataUrl).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
}


// Nav Bar
const userConnectButton = document.getElementById('btnConnect');
userConnectButton.onclick = login;

const userProfileButton = document.getElementById('btnUserInfo');
userProfileButton.onclick = openUserInfo;

const openCreateItemButton = document.getElementById('btnOpenCreateItem');
openCreateItemButton.onclick = () => showElement(createItemForm);

// user profile
const userInfo = document.getElementById('userInfo');
const userUsernameField = document.getElementById('txtUsername');
const userEmailField = document.getElementById('txtEmail');
const userAvatarImg = document.getElementById('imgAvatar');
const userAvatarFile = document.getElementById('fileAvatar');

document.getElementById('btnCloseUserInfo').onclick = () => hideElement(userInfo);
document.getElementById('btnLogout').onclick = logOut;
document.getElementById('btnSaveUserInfo').onclick = saveUserInfo;

// item creation
const createItemForm = document.getElementById('createItem');

const createItemNameField = document.getElementById('txtCreateItemName');
const createItemDescriptionField = document.getElementById('txtCreateItemDescription');
const createItemPriceField = document.getElementById('numCreateItemPrice');
const createItemStatusField = document.getElementById('selectCreateItemStatus');
const createItemFile = document.getElementById('fileCreateItemFile');
document.getElementById('btnCloseCreateItem').onclick = () => hideElement(createItemForm);
document.getElementById('btnCreateItem').onclick = createItem;


init();
