const CONTRACT_ADDRESS = '0x875cde3ef3Dd5376DF4Bf57F52180c1008B4B6F2';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp,
    maxHp: characterData.maxHp,
    attackDamage: characterData.attackDamage
  };
};

export {CONTRACT_ADDRESS, transformCharacterData};