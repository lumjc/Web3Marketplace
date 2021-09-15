Moralis.initialize("l8T3PYmGe5rBWzNswX90jSlbQ9p7kjxpznHHjPBO");
Moralis.serverURL = 'https://t4jve9pvn40e.grandmoralis.com:2053/server'

// enable moralis and connect to web3
init = async () => {
    window.web3 = await Moralis.web3.enable();
    initUser();
}

login = async () => {
    try {
        await Moralis.authenticate();
        initUser();
    } catch (error) {
        alert(error)
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

init()