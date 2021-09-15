Moralis.initialize("l8T3PYmGe5rBWzNswX90jSlbQ9p7kjxpznHHjPBO");
Moralis.serverURL = 'https://t4jve9pvn40e.grandmoralis.com:2053/server'

// enable moralis and connect to web3
init = async () => {
    hideElement(userInfo)
    window.web3 = await Moralis.web3.enable();
    initUser();
}

login = async () => {
    try {
        await Moralis.authenticate();
        console.log("logged in")
        initUser();
    } catch (error) {
        alert(error)
    }
}

async function logOut() {
    await Moralis.User.logOut();
    hideElement(userInfo)
    initUser()
    console.log("logged out");
  }

openUserInfo = async () => {
    user = await Moralis.User.current()
    if (user) {
        showElement(userInfo)
    } else {
        login()
    }
} 

initUser = async () => {
    if (await Moralis.User.current()) {
        hideElement(userConnectButton)
        showElement(userProfileButton)
} else {
    showElement(userConnectButton)
    hideElement(userProfileButton)
    }
}
hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block"

const userConnectButton = document.getElementById("btnConnect")
userConnectButton.onclick = login;

const userProfileButton = document.getElementById("btnUserInfo")
userProfileButton.onclick = openUserInfo;

const userInfo = document.getElementById("userInfo")
document.getElementById("btnCloseUserInfo").onclick = () => hideElement(userInfo)
document.getElementById("btnLogout").onclick = logOut

init()