/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
Moralis.initialize('l8T3PYmGe5rBWzNswX90jSlbQ9p7kjxpznHHjPBO');
Moralis.serverURL = 'https://t4jve9pvn40e.grandmoralis.com:2053/server';

// enable moralis and connect to web3
init = async () => {
  hideElement(userInfo);
  hideElement(createItemForm)
  window.web3 = await Moralis.web3.enable();
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

hideElement = (element) => element.style.display = 'none';
showElement = (element) => element.style.display = 'block';

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

const userConnectButton = document.getElementById('btnConnect');
userConnectButton.onclick = login;

const userProfileButton = document.getElementById('btnUserInfo');
userProfileButton.onclick = openUserInfo;

const userInfo = document.getElementById('userInfo');
const userUsernameField = document.getElementById('txtUsername');
const userEmailField = document.getElementById('txtEmail');
const userAvatarImg = document.getElementById('imgAvatar');
const userAvatarFile = document.getElementById('fileAvatar');

document.getElementById('btnCloseUserInfo').onclick = () => hideElement(userInfo);
document.getElementById('btnLogout').onclick = logOut;
document.getElementById('btnSaveUserInfo').onclick = saveUserInfo;

const createItemForm = document.getElementById('createItem');

const creatItemNameField = document.getElementById('txtCreateItemName');
const createItemDescription = document.getElementById('txtCreateItemDescription');
const createItemPriceField = document.getElementById('numCreateItemPrice');
const createItemStatusField = document.getElementById('selectCreateItemStatus');
const createItemFile = document.getElementById('fileCreateItemFile');

const openCreateItemButton = document.getElementById('btnOpenCreateItem');
openCreateItemButton.onclick = () => showElement(createItemForm)
document.getElementById('btnCloseCreateItem').onclick = () => hideElement(createItemForm);


init();
