/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
Moralis.initialize('qbfQUUqYq1RAdHnPZTnlEemxfGaBmOGOE6DzRNKA');
Moralis.serverURL = 'https://uyijtrqipgcq.grandmoralis.com:2053/server';


const TOKEN_CONTRACT_ADDRESS = '0x24088142577870A60ab7DAB7283884c6F584F195';
const MARKETPLACE_CONTRACT_ADDRESS = '0x393ab4C99eDC091a4c41244940266610245365FE';
hideElement = (element) => element.style.display = 'none';
showElement = (element) => element.style.display = 'block';


// enable moralis and connect to web3
init = async () => {
  hideElement(userItemsSection);
  hideElement(userInfo);
  hideElement(createItemForm);
  window.web3 = await Moralis.enable();
  window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
  window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, MARKETPLACE_CONTRACT_ADDRESS);
  initUser();
  loadItems();
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

  user = await Moralis.User.current();
  const userAddress = user.get('ethAddress');

  switch (createItemStatusField.value) {
    case '0':
      return;
    case '1':
      await ensureMarketplaceIsApproved(nftId, TOKEN_CONTRACT_ADDRESS);
      await window.marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, createItemPriceField.value).send({from: userAddress});
      break;
    case '2':
      alert('Not yet supported');
      return;
  }
};

mintNft = async (metadataUrl) => {
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
  ownedItems.forEach((item) => {
    getAndRenderItemData(item, renderUserItem);
  });
};

loadItems = async () => {
  const items = await Moralis.Cloud.run('getItems');
  items.forEach((item) => {
    getAndRenderItemData(item, renderItem);
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

renderItem = (item) => {
  const itemForSale = marketplaceItemTemplate.cloneNode(true);
  if (item.sellerAvatar) {
    itemForSale.getElementsByTagName('img')[0].src = item.sellerAvatar.url();
    itemForSale.getElementsByTagName('img')[0].alt = item.sellerUsername;
  }

  itemForSale.getElementsByTagName('img')[1].src = item.image;
  itemForSale.getElementsByTagName('img')[1].alt = item.name;
  itemForSale.getElementsByTagName('h5')[0].innerText = item.name;
  itemForSale.getElementsByTagName('p')[0].innerText = item.description;

  itemForSale.getElementsByTagName('button')[0].innerText = `Buy for ${item.askingPrice}`;
  itemForSale.id = `item-${item.uid}`;
  itemsForSale.appendChild(itemForSale);
};


getAndRenderItemData = (item, renderFunction) => {
  fetch(item.tokenUri)
      .then((response) => response.json())
      .then((data) => {
        item.name = data.name;
        item.description = data.description;
        item.image = data.image;
        renderFunction(item);
      });
};

ensureMarketplaceIsApproved = async (tokenId, tokenAddress) => {
  user = await Moralis.User.current();
  const userAddress = user.get('ethAddress');
  const contract = new web3.eth.Contract(tokenContractAbi, tokenAddress);
  const approvedAddress = await contract.methods.getApproved(tokenId).call({from: userAddress});
  if (approvedAddress != MARKETPLACE_CONTRACT_ADDRESS) {
    await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId).send({from: userAddress});
  }
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

const userItemTemplate = initTemplate('ItemTemplate');
const marketplaceItemTemplate = initTemplate('marketplaceItemTemplate');

// Items for Sale

const itemsForSale = document.getElementById('itemsForSale');


init();


