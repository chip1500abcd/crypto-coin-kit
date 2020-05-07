import {BTC, NetWorkType} from "../../../BTC";
import keyProvider from "../../../BTC/keyProvider";

const privateKey =
  "06a523eede06e72a472056be31429bb4016fe85f10389be898dbe283233131d0";
const publicKey =
  "03fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72";

const kp1 = keyProvider(privateKey, publicKey);

const privateKeyOne =
  "dc1429816a0f616f3c815bda70bea0fdef9039a71e1a3b08272f9452a59027c4";

const publicKeyOne =
  "02f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa2";

const kp2 = keyProvider(privateKeyOne, publicKeyOne);

const utxoOne = {
  hash: "d07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355",
  index: 1,
  sequence:0xffffffff,
  utxo: {
    publicKey,
    script: "a914915892366a6cdf24afa6e1c480db2ad88c63378087",
    value: 3578100
  }
};

const utxoTwo = {
  hash: "89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0",
  index: 0,
  utxo: {
    publicKey: publicKeyOne,
    script: "a914745c56190d1fe8274e7ebe9dd4fe10ca3484959587",
    value: 2524291
  }
};

const multiSignUtxo = [
  {
    hash: 'ef0323f679a2406165ab490d24b8fa5773b7721e7cd6e421098f00a9afdc7ee0',
    index: 0,
    utxo: {
      publicKeys: [publicKey, publicKeyOne],
      value: 11110,
    }
  },
]

describe("coin.BTC", () => {
  const btc = new BTC(NetWorkType.mainNet);
  const xtn = new BTC(NetWorkType.testNet);

  it("should generate correct address", () => {
    expect(btc.generateAddress(publicKey)).toBe(
      "3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj"
    );

    expect(xtn.generateAddress(publicKey)).toBe(
      "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
    );
    expect(xtn.generateAddress(publicKeyOne)).toBe(
      "2N3rUzBBAMqkiSra2o6DCb6LZPReQVU3LVe"
    );

    expect(xtn.generateMultiSignAddress([
      publicKey,
      publicKeyOne,
    ], 2)).toBe('2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V');
  });

  it("should valid a address", () => {
    const result = btc.isAddressValid("3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pj");
    expect(result).toBe(true);
    const failResult = btc.isAddressValid("3EwY1PaQ5fB4M4nvWRYgUn2LNmokeJ36Pu");
    expect(failResult).toBe(false);
    const failedResult = btc.isAddressValid("0xtastere2uieuriur");
    expect(failedResult).toBe(false);
    const validP2wpkhAddr = "bc1qcsfgcpf0nhcqg7psw2729a6cld7z4fsq4w7qtz";
    expect(btc.isAddressValid(validP2wpkhAddr)).toBe(true);
    const validP2wshAddr = "bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej";
    expect(btc.isAddressValid(validP2wshAddr)).toBe(true);
    const invalidP2wshAddr = "bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvze";
    expect(btc.isAddressValid(invalidP2wshAddr)).toBe(false);
  });

  it("should generate the transaction", async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      },
      version: 2,
      locktime: 0,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
      "34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0"
    );
    expect(result.txHex).toEqual(
      "020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000"
    );
  });

  it("should generate the transaction with locktime and version 1", async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      },
      version: 1,
      locktime: 628083,
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2]);
    expect(result.txId).toEqual(
        "17eca42ddd5cb440636c333c79b6fee67dfe1368da3790b2022d5f61bd58fc62"
    );
    expect(result.txHex).toEqual(
        "010000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808702483045022100f5b55b77cc6379a73767e31f759b4f1dbb3ae9a544cfd5c78bf7a4ef4be339880220210ed1a9a60d75ce1fe9224618ffc9af331256d674dc497a8df1d3630b91f431012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220335114f2b9b3805eef2607c3b699d788187eab54c0279edb3d28a59c507ba1d2022007d32006272932820aaeb5d140469edeb62ba325fae5ad97ee9da376bf1c20e9012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa273950900"
    );
  });

  it("should generate the transaction even if it have duplicated key provider", async () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };

    const result = await xtn.generateTransaction(txData, [kp1, kp2, kp1, kp2]);
    expect(result.txId).toEqual(
      "34bd17dea44660edf68e21c4024b52bc738aec0a9c052f67fa57d4ab26c334b0"
    );
    expect(result.txHex).toEqual(
      "020000000001025573b0158c7ce0b25bb3d0cff7344e369ca3dbcee2ce4d888840fff49ae17cd00100000017160014e9cf9131d9c02a3a02d246bb4297b5606c6cb2f9ffffffffe014dc2363486a66e337b802da70722a32065f7a9e4fd4daf0e067aa31f8e58900000000171600143007abdafe8f875c3d3b714428e7761494a71f6cffffffff02f78f01000000000017a914915892366a6cdf24afa6e1c480db2ad88c6337808798895b000000000017a914915892366a6cdf24afa6e1c480db2ad88c633780870247304402206b891a2c6b2a95bb7b7e25275544f3dd761269392dde98ab65c8f8187194ce0502203061881a7d0e92fd19ac68b77a1fee35d7b6b7b72e8fce369a35088c1b35cca7012103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd72024730440220236f1c70df027dd7c0c862c9b89b28cb3fca6a96d4c73f7f565b7cc4b0fdff6902202262c87aec91d1ad9e661d807d5f9a8aaacd8a634028a74013cc2141c8750d13012102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa200000000"
    );
  });

  it("should generate psbt base64 string", () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };

    const result = xtn.generatePsbt(txData);
    expect(result).toEqual(
      "cHNidP8BAJwCAAAAAlVzsBWMfOCyW7PQz/c0Tjaco9vO4s5NiIhA//Sa4XzQAQAAAAD/////4BTcI2NIambjN7gC2nByKjIGX3qeT9Ta8OBnqjH45YkAAAAAAP////8C948BAAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIeYiVsAAAAAABepFJFYkjZqbN8kr6bhxIDbKtiMYzeAhwAAAAAAAQEg9Jg2AAAAAAAXqRSRWJI2amzfJK+m4cSA2yrYjGM3gIcBBBYAFOnPkTHZwCo6AtJGu0KXtWBsbLL5AAEBIIOEJgAAAAAAF6kUdFxWGQ0f6CdOfr6d1P4QyjSElZWHAQQWABQwB6va/o+HXD07cUQo53YUlKcfbAAAAA=="
    );
  });

  it("should parse pbst string", () => {
    const txData = {
      inputs: [utxoOne, utxoTwo],
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 102391,
        fee: 1000,
        changeAddress: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
      }
    };

    const result = xtn.generatePsbt(txData);
    const tx = xtn.parsePsbt(result);
    expect(tx.inputs.length).toBe(2);
    expect(tx.inputs[0].txId).toEqual(
      "d07ce19af4ff4088884dcee2cedba39c364e34f7cfd0b35bb2e07c8c15b07355"
    );
    expect(tx.inputs[1].txId).toEqual(
      "89e5f831aa67e0f0dad44f9e7a5f06322a7270da02b837e3666a486323dc14e0"
    );
    expect(tx.outputs[0].address).toEqual(
      "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
    );
    expect(tx.outputs[1].address).toEqual(
      "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4"
    );
    expect(tx.outputs[0].value).toEqual(102391);
    expect(tx.outputs[1].value).toEqual(5999000);
  });

  // https://btc.com/a7263645784c46f36a8200c06d349df82206f8b2b5f16f0ddd9adaf0b1a0f675
  it('should generate omni tx',  async () => {
    const privateKey = '0437d0a4ae601819365884a858da3f61074e7bedff30b7d716c406e1937092e1';
    const publicKey = '02a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c382';
    const keyPair = keyProvider(privateKey,publicKey);

    const utxo = {
      hash: 'e6f3d78f3d9acf72329263e2c85206129c5c3c56519e21879325b01b0748e2b8',
      index:0,
      utxo: {
        publicKey:publicKey,
        value:40000
      }
    };

    const txData = {
      inputs:[utxo],
      to: '38c8FFS9W4QEW55WXgo2wX8HZJCutH89VT',
      fee: 39454,
      changeAddress: '3C5VmDeH3x6x9fPm4cft3qVhzvv8R4Ln7K',
      omniAmount:66600000
    };

    const tx = await btc.generateOmniTransaction(txData,[keyPair]);
    expect(tx.txId).toBe('d556fa715e96c99b2ace29b2a57fa43a9acea239ae258b04a96c846ef78ad199');
    expect(tx.txHex).toBe('02000000000101b8e248071bb0259387219e51563c5c9c120652c8e263923272cf9a3d8fd7f3e600000000171600141ea4ea0a12d7c2b07e9084d36abd03a2edd72798ffffffff02220200000000000017a9144bdc14152999fc8ad8c6df4c20946ba1e572c95e870000000000000000166a146f6d6e69000000000000001f0000000003f83c400247304402201e6dbbee8c909a91efc5954fc58112d74a7069deb1e4aebc3a8516b88d158f1c02203872389b0a7b425ab94e2931b7ceaec4054b1eaea9ca9e2a0955ddd5def571b9012102a18c6e271a995b162348b4332b63f13bf031617192d6232e809210ad5d85c38200000000')
  });

  it("should generate the multiSign transaction", async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 10110,
        fee: 1000,
        changeAddress: "2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V"
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [kp1, kp2]);

    expect(txId).toBe('848f52e0ab465eac50f499d9b662b43d0914149995d856faedb82d43640af862');
    expect(txHex).toBe('02000000000101e07edcafa9008f0921e4d67c1e72b77357fab8240d49ab656140a279f62303ef00000000232200207690f26b840a14f928d7182e348ef3b2faa484e4b34d49ecec1b3013faadb75affffffff027e2700000000000017a914915892366a6cdf24afa6e1c480db2ad88c63378087000000000000000017a914ab465b094d7aaad13cbdbdfebb32115690b36ad687040047304402207ef9eba6ce9bd55260b3e09587ad07aea39fe39859978ac72c72907ae3f348a0022055eeeb73697fdc8bea5a9ac8f49f46c5ddc0db60f0e624f331044d15f53f4b1301483045022100b2122f170e9eeb2d7e18126e804085af912e10d27925acf428329642a0e14aa2022079a9e1c602b7f1987cf12aa849314116fdb9dc57f3498195ca91a65075f4b2780147522103fbe02e16d35d3c9c6772c75ba5d0d1387573724082266ea667c53b9d00decd722102f325a85902d264dbcb0cbe144e9b2463f8252bd0c51bc19666f4c82461e4baa252ae00000000');
  });

  it("should generate the multiSign transaction signatures", async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 10110,
        fee: 1000,
        changeAddress: "2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V"
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };
    const signatures = await xtn.getMultiSignTransactionSignature(txData, [kp1]);

    expect(signatures).toStrictEqual(['304402207ef9eba6ce9bd55260b3e09587ad07aea39fe39859978ac72c72907ae3f348a0022055eeeb73697fdc8bea5a9ac8f49f46c5ddc0db60f0e624f331044d15f53f4b1301'])
  })


  it("the multiSign transaction signer count cannot less than requires", async () => {
    const txData = {
      inputs: multiSignUtxo,
      outputs: {
        to: "2N6Vk58WRh7gQYrRUBZAZ6j1bb81vR8G7F4",
        amount: 10110,
        fee: 1000,
        changeAddress: "2N8rqpUpbyJMtSXK6obH5GVufZ5rwE9fi5V"
      },
      version: 2,
      locktime: 0,
      requires: 2,
    };

    const testFn = async () => {
      try {
        const {txId, txHex} = await xtn.generateMultiSignTransaction(txData, [kp1])
      } catch (e) {
        throw new Error(e);
      }
    };

    await expect(testFn()).rejects.toThrow();
  });
});
