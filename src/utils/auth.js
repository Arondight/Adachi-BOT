const { update, get, push } = require('./database');

exports.isMaster = userID => {
    return userID === master;
}

exports.sendPrompt = async (id, name, auth, type) => {
    let you = type === 'group' ? '本群' : name;
    await bot.sendMessage(id, `${you}无${auth}权限`, type);
}

exports.setAuth = async (auth, target, isOn) => {
    let data = await get('authority', 'user', { userID: target });
    if (data === undefined) {
        await push('authority', 'user', { userID: target, [auth]: isOn });
    } else {
        await update('authority', 'user', { userID: target }, { ...data, [auth]: isOn });
    }
}

exports.hasAuth = async (userID, auth) => {
    let data = await get('authority', 'user', { userID });
    return data === undefined || data[auth] === undefined || data[auth] === true;
}
