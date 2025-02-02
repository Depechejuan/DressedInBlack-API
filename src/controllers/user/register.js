"use strict";

const {
    hashPassword,
    generateRandomValidationCode,
    generateUUID,
} = require("../../services/crypto-services");
const {
    getUserByEmail,
    saveUser,
    saveValidationCode,
} = require("../../services/db-service");
const {
    didNotAcceptedTOS,
    emailAlreadyRegistered,
} = require("../../services/error-service");
const { getTimerForValidationCode } = require("../../services/time-service");

async function register(userData) {
    if (!userData.acceptedTOS) {
        throw didNotAcceptedTOS();
    }

    const alreadyRegistered = await getUserByEmail(userData.email);
    if (alreadyRegistered) {
        throw emailAlreadyRegistered();
    }

    const hashedPassword = await hashPassword(userData.password);

    const randomCode = generateRandomValidationCode();
    const newUserId = generateUUID();

    const user = {
        ...userData,
        id: newUserId,
        password: hashedPassword,
    };
    await saveUser(user);

    // const expirationTime = getTimerForValidationCode(60);
    // const validationCode = {
    //     id: generateUUID(),
    //     idUser: user.id,
    //     code: randomCode,
    //     expirationTime,
    // };
    // await saveValidationCode(validationCode);

    return {
        success: true,
        dibreg,
    };
}

module.exports = { register };
