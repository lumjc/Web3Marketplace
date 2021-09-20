/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
Moralis.initialize('qbfQUUqYq1RAdHnPZTnlEemxfGaBmOGOE6DzRNKA');
Moralis.serverURL = 'https://uyijtrqipgcq.grandmoralis.com:2053/server';


const TOKEN_CONTRACT_ADDRESS = '0x9db2528041F211d825412C8F2B2aC443b2c4fDbD';
hideElement = (element) => element.style.display = 'none';
showElement = (element) => element.style.display = 'block';


// enable moralis and connect to web3
init = async () => {
  hideElement(userItemsSection);
  hideElement(userInfo);
  hideElement(createItemForm);
  web3 = await Moralis.enable();
  window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
  initUser();
};

initUser = async () => {
  if (await Moralis.User.current()) {
    hideElement(userConnectButton);
    showElement(userProfileButton);
    showElement(openCreateItemButton);
    showElement(openUserItemsButton);
    loadUserItems();
  } else {
    showElement(userConnectButton);
    hideElement(userProfileButton);
    hideElement(openCreateItemButton);
    hideElement(openUserItemsButton);
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
  console.log(window.tokenContract);
  const receipt = await window.tokenContract.methods.createItem(metadataUrl).send({from: ethereum.selectedAddress});
  console.log(receipt);
  return receipt.events.Transfer.returnValues.tokenId;
};

openUserItems = async () => {
  user = await Moralis.User.current();
  if (user) {
    showElement(userItemsSection);
  } else {
    login();
  }
};

loadUserItems = async () => {
  const ownedItems = await Moralis.Cloud.run('getUserItems');
  ownedItems.forEach(item => {
    getAndRenderItemData(item, renderUserItem);
  });
};

initTemplate = (id) => {
  const template = document.getElementById(id);
  template.id = '';
  template.parentNode.removeChild(template);
  return template;
};

renderUserItem = (item) => {
  const userItem = userItemTemplate.cloneNode(true);
  userItem.getElementsByTagName('img')[0].src = item.image;
  userItem.getElementsByTagName('img')[0].alt = item.name;
  userItem.getElementsByTagName('h5')[0].innerText = item.name;
  userItem.getElementsByTagName('p')[0].innerText = item.description;
  userItems.appendChild(userItem);
};

getAndRenderItemData = (item, renderFunction) => {
  fetch(item.tokenUri)
      .then((response) => response.json())
      .then((data) => {
        data.symbol = item.symbol;
        data.tokenId = item.tokenId;
        data.tokenAddress = item.tokenAddress;
        renderFunction(data);
      });
};


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

// user items
const userItemsSection = document.getElementById('userItems');
const userItems = document.getElementById('userItemsList');
document.getElementById('btnCloseUserItems').onclick = () => hideElement(userItemsSection);
const openUserItemsButton = document.getElementById('btnMyItems');
openUserItemsButton.onclick = openUserItems;

const userItemTemplate = initTemplate('itemTemplate');


init();

