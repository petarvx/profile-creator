import { HDPrivateKey } from "bsv-wallet";

export {};

declare module "bitcoin-bap" {
  export interface Identity {
    name: string;
    description: string;
    identityKey: string;
    rootPath: string;
    rootAddress: string;
    previousPath: string;
    currentPath: string;
    lastIdPath: string;
    idSeed: string;
    identityAttributes: any;
  }

  export type PathPrefix =
    | `/${number}/${number}/${number}`
    | `/${number}'/${number}'/${number}'`;

  export interface Attestation {
    type: string;
    hash: string;
    sequence: string;
    signingProtocol: string;
    signingAddress: string;
    signature: string;
    data?: string;
    verified?: boolean;
  }

  export class BAP_ID {
    HDPrivateKey: HDPrivateKey;
    BAP_SERVER: string;
    BAP_TOKEN: string;
    rootPath: string;
    previousPath: string;
    currentPath: string;
    idSeed: string;

    idName: string;
    description: string;

    rootAddress: string;
    identityKey: string;
    identityAttributes: { [key: string]: any };

    constructor(
      HDPrivateKey: HDPrivateKey,
      identityAttributes: { [key: string]: any },
      idSeed: string
    );

    deriveIdentityKey(address: string): string;

    /**
     * Helper function to parse identity attributes
     *
     * @param identityAttributes
     * @returns {{}}
     */
    parseAttributes(identityAttributes: { [key: string]: any } | string): {
      [key: string]: any;
    };

    /**
     * Parse a text of urn string into identity attributes
     *
     * urn:bap:id:name:John Doe:e2c6fb4063cc04af58935737eaffc938011dff546d47b7fbb18ed346f8c4d4fa
     * urn:bap:id:birthday:1990-05-22:e61f23cbbb2284842d77965e2b0e32f0ca890b1894ca4ce652831347ee3596d9
     * urn:bap:id:over18:1:480ca17ccaacd671b28dc811332525f2f2cd594d8e8e7825de515ce5d52d30e8
     *
     * @param urnIdentityAttributes
     */
    parseStringUrns(urnIdentityAttributes: string): { [key: string]: any };

    /**
     * Returns the identity key
     *
     * @returns {*|string}
     */
    getIdentityKey(): string;

    /**
     * Returns all the attributes in the identity
     *
     * @returns {*}
     */
    getAttributes(): { [key: string]: any };
    /**
     * Get the value of the given attribute
     *
     * @param attributeName
     * @returns {{}|null}
     */
    getAttribute(attributeName: string): any;

    /**
     * Set the value of the given attribute
     *
     * If an empty value ('' || null || false) is given, the attribute is removed from the ID
     *
     * @param attributeName string
     * @param attributeValue any
     * @returns {{}|null}
     */
    setAttribute(attributeName: string, attributeValue: any): void;

    /**
     * Unset the given attribute from the ID
     *
     * @param attributeName
     * @returns {{}|null}
     */
    unsetAttribute(attributeName: string): void;

    /**
     * Get all attribute urn's for this id
     *
     * @returns {string}
     */
    getAttributeUrns(): string;

    /**
     * Create an return the attribute urn for the given attribute
     *
     * @param attributeName
     * @returns {string|null}
     */
    getAttributeUrn(attributeName: string): string | null;

    /**
     * Add an attribute to this identity
     *
     * @param attributeName
     * @param value
     * @param nonce
     */
    addAttribute(attributeName: string, value: any, nonce?: string): void;

    getRootPath(): string;

    /**
     * Increment current path to a new path
     *
     * @returns {*}
     */
    incrementPath(): void;

    /**
     * Check whether the given path is a valid path for use with this class
     * The signing paths used here always have a length of 3
     *
     * @param path The last part of the signing path (example "/0/0/1")
     * @returns {boolean}
     */
    validatePath(path: string): boolean;

    /**
     * Get the OP_RETURN for the initial ID transaction (signed with root address)
     *
     * @returns {[]}
     */
    getInitialIdTransaction(): string[];

    /**
     * Get the OP_RETURN for the ID transaction of the current address / path
     *
     * @returns {[]}
     */
    getIdTransaction(previousPath: string): string[];

    /**
     * Get address for given path
     *
     * @param path
     * @returns {*}
     */
    getAddress(path: string): string;

    /**
     * Get current signing address
     *
     * @returns {*}
     */
    getCurrentAddress(): string;

    /**
     * Get the public key for encrypting data for this identity
     */
    getEncryptionPublicKey(): string;

    /**
     * Get the public key for encrypting data for this identity, using a seed for the encryption
     */
    getEncryptionPublicKeyWithSeed(seed: string): string;

    /**
     * Encrypt the given string data with the identity encryption key
     * @param stringData
     * @param counterPartyPublicKey Optional public key of the counterparty
     * @return string Base64
     */
    encrypt(stringData: string, counterPartyPublicKey?: string): string;

    /**
     * Decrypt the given ciphertext with the identity encryption key
     * @param ciphertext
     * @param counterPartyPublicKey Optional public key of the counterparty
     */
    decrypt(ciphertext: string, counterPartyPublicKey?: string): string;

    /**
     * Encrypt the given string data with the identity encryption key
     * @param stringData
     * @param seed String seed
     * @param counterPartyPublicKey Optional public key of the counterparty
     * @return string Base64
     */
    encryptWithSeed(
      stringData: string,
      seed: string,
      counterPartyPublicKey?: string
    ): string;

    /**
     * Decrypt the given ciphertext with the identity encryption key
     * @param ciphertext
     * @param seed String seed
     * @param counterPartyPublicKey Public key of the counterparty
     */
    decryptWithSeed(
      ciphertext: string,
      seed: string,
      counterPartyPublicKey?: string
    ): string;

    private getEncryptionPrivateKeyWithSeed(seed: string): string;
    /**
     * Get an attestation string for the given urn for this identity
     *
     * @param urn
     * @returns {string}
     */
    getAttestation(urn: string): string;

    /**
     * Generate and return the attestation hash for the given attribute of this identity
     *
     * @param attribute Attribute name (name, email etc.)
     * @returns {string}
     */
    getAttestationHash(attribute: string): string;

    /**
     * Sign a message with the current signing address of this identity
     *
     * @param message
     * @param signingPath
     * @returns {{address, signature}}
     */
    signMessage(
      message: string | Buffer,
      signingPath: string
    ): {
      address: string;
      signature: string;
    };

    /**
     * Sign a message using a key based on the given string seed
     *
     * This works by creating a private key from the root key of this identity. It will always
     * work with the rootPath / rootKey, to be deterministic. It will not change even if the keys
     * are rotated for this ID.
     *
     * This is used in for instance deterministic login systems, that do not support BAP.
     *
     * @param message
     * @param seed {string} String seed that will be used to generate a path
     */
    signMessageWithSeed(
      message: string,
      seed: string
    ): { address: string; signature: string };

    /**
     * Sign an op_return hex array with AIP
     * @param opReturn {array}
     * @param signingPath {string}
     * @param outputType {string}
     * @return {[]}
     */
    signOpReturnWithAIP(
      opReturn: string[],
      signingPath?: string,
      outputType?: BufferEncoding
    ): string[];

    /**
     * Construct an AIP buffer from the op return data
     * @param opReturn
     * @returns {Buffer}
     */
    getAIPMessageBuffer(opReturn: string[]): Buffer;

    /**
     * Get all signing keys for this identity
     */
    getIdSigningKeys(): Promise<any>;

    /**
     * Get all attestations for the given attribute
     *
     * @param attribute
     */
    getAttributeAttestations(attribute: string): Promise<any>;

    /**
     * Helper function to get attestation from a BAP API server
     *
     * @param apiUrl
     * @param apiData
     * @returns {Promise<any>}
     */
    getApiData(apiUrl: string, apiData: any): Promise<any>;

    /**
     * Import an identity from a JSON object
     *
     * @param identity{{}}
     */
    import(identity: Identity): void;

    /**
     * Export this identity to a JSON object
     * @returns {{}}
     */
    export(): Identity;
  }

  /**
   * BAP class
   *
   * Creates an instance of the BAP class and uses the given HDPrivateKey for all BAP operations.
   *
   * @param HDPrivateKey
   */
  export class BAP {
    HDPrivateKey: HDPrivateKey;
    ids: { [key: string]: BAP_ID };
    BAP_SERVER: string;
    BAP_TOKEN: string;
    lastIdPath: string;

    constructor(HDPrivateKey: string, token?: string);

    /**
     * Get the public key of the given childPath, or of the current HDPrivateKey of childPath is empty
     *
     * @param childPath Full derivation path for this child
     * @returns {*}
     */
    getPublicKey(childPath: string): string;

    /**
     * Get the public key of the given childPath, or of the current HDPrivateKey of childPath is empty
     *
     * @param childPath Full derivation path for this child
     * @returns {*}
     */
    getHdPublicKey(childPath: string): string;

    /**
     * This function verifies that the given bapId matches the given root address
     * This is used as a data integrity check
     *
     * @param bapId BAP_ID instance
     */
    checkIdBelongs(bapId: BAP_ID): boolean;

    /**
     * Returns a list of all the identity keys that are stored in this instance
     *
     * @returns {string[]}
     */
    listIds(): string[];

    /**
     * Create a new Id and link it to this BAP instance
     *
     * This function uses the length of the #ids of this class to determine the next valid path.
     * If not all ids related to this HDPrivateKey have been loaded, determine the path externally
     * and pass it to newId when creating a new ID.
     *
     * @param path
     * @param identityAttributes
     * @param idSeed
     * @returns {*}
     */
    newId(path?: string, identityAttributes?: any, idSeed?: string): BAP_ID;

    /**
     * Remove identity
     *
     * @param idKey
     * @returns {*}
     */
    removeId(idKey: string): void;

    /**
     * Get the next valid path for the used HDPrivateKey and loaded #ids
     *
     * @returns {string}
     */
    getNextValidPath(): PathPrefix;

    /**
     * Get a certain Id
     *
     * @param identityKey
     * @returns {null}
     */
    getId(identityKey: string): BAP_ID | null;

    /**
     * This function is used when manipulating ID's, adding or removing attributes etc
     * First create an id through this class and then use getId to get it. Then you can add/edit or
     * increment the signing path and then re-set it with this function.
     *
     * Note: when you getId() from this class, you will be working on the same object as this class
     * has and any changes made will be propagated to the id in this class. When you call exportIds
     * your new changes will also be included, without having to setId().
     *
     * @param bapId
     */
    setId(bapId: BAP_ID): void;

    /**
     * This function is used to import IDs and attributes from some external storage
     *
     * The ID information should NOT be stored together with the HD private key !
     *
     * @param idData Array of ids that have been exported
     * @param encrypted Whether the data should be treated as being encrypted (default true)
     */
    importIds(idData: any, encrypted: boolean): void;

    /**
     * Export all the IDs of this instance for external storage
     *
     * By default this function will encrypt the data, using a derivative child of the main HD key
     *
     * @param encrypted Whether the data should be encrypted (default true)
     * @returns {[]|*}
     */
    exportIds(encrypted: boolean): any;

    /**
     * Encrypt a string of data
     *
     * @param string
     * @returns {string}
     */
    encrypt(string: string): string;

    /**
     * Decrypt a string of data
     *
     * @param string
     * @returns {string}
     */
    decrypt(string: string): string;

    /**
     * Sign an attestation for a user
     *
     * @param attestationHash The computed attestation hash for the user - this should be calculated with the BAP_ID class for an identity for the user
     * @param identityKey The identity key we are using for the signing
     * @param counter
     * @param dataString Optional data string that will be appended to the BAP attestation
     * @returns {string[]}
     */
    signAttestationWithAIP(
      attestationHash: string,
      identityKey: string,
      counter?: number,
      dataString?: string
    ): string[];

    /**
     * Verify an AIP signed attestation for a user
     *
     * [
     *   '0x6a',
     *   '0x31424150537561506e66476e53424d33474c56397968785564596534764762644d54',
     *   '0x415454455354',
     *   '0x33656166366361396334313936356538353831366439336439643034333136393032376633396661623034386333633031333663343364663635376462383761',
     *   '0x30',
     *   '0x7c',
     *   '0x313550636948473232534e4c514a584d6f5355615756693757537163376843667661',
     *   '0x424954434f494e5f4543445341',
     *   '0x31477531796d52567a595557634638776f6f506a7a4a4c764d383550795a64655876',
     *   '0x20ef60c5555001ddb1039bb0f215e46571fcb39ee46f48b089d1c08b0304dbcb3366d8fdf8bafd82be24b5ac42dcd6a5e96c90705dd42e3ad918b1b47ac3ce6ac2'
     * ]
     *
     * @param tx Array of hex values for the OP_RETURN values
     * @returns {{}}
     */
    verifyAttestationWithAIP(tx: string[]): Attestation;

    /**
     * For BAP attestations we use all fields for the attestation
     *
     * @param attestationHash
     * @param counter
     * @param address
     * @param signature
     * @param dataString Optional data string that will be appended to the BAP attestation
     * @returns {[string]}
     */
    createAttestationTransaction(
      attestationHash: string,
      counter: number,
      address: string,
      signature: string,
      dataString: string
    ): string[];

    /**
     * This is a re-creation of how the bitcoinfiles-sdk creates a hash to sign for AIP
     *
     * @param attestationHash
     * @param counter
     * @param dataString Optional data string
     * @returns {Buffer}
     */
    getAttestationBuffer(
      attestationHash: string,
      counter: number,
      dataString: string
    ): Buffer;

    /**
     * Verify that the identity challenge is signed by the address
     *
     * @param message Buffer or utf-8 string
     * @param address Bitcoin address of signee
     * @param signature Signature base64 string
     *
     * @return boolean
     */
    verifySignature(
      message: string | Buffer,
      address: string,
      signature: string
    ): boolean;

    /**
     * Check whether the given transaction (BAP OP_RETURN) is valid, is signed and that the
     * identity signing is also valid at the time of signing
     *
     * @param idKey
     * @param address
     * @param challenge
     * @param signature
     *
     * @returns {Promise<boolean|*>}
     */
    verifyChallengeSignature(
      idKey: string,
      address: string,
      challenge: string,
      signature: string
    ): Promise<boolean>;

    /**
     * Check whether the given transaction (BAP OP_RETURN) is valid, is signed and that the
     * identity signing is also valid at the time of signing
     *
     * @param tx
     * @returns {Promise<boolean|*>}
     */
    isValidAttestationTransaction(tx: string[]): Promise<any>;

    /**
     * Get all signing keys for the given idKey
     *
     * @param address
     * @returns {Promise<*>}
     */
    getIdentityFromAddress(address: string): Promise<any>;

    /**
     * Get all signing keys for the given idKey
     *
     * @param idKey
     * @returns {Promise<*>}
     */
    getIdentity(idKey: string): Promise<any>;

    /**
     * Get all attestations for the given attestation hash
     *
     * @param attestationHash
     */
    getAttestationsForHash(attestationHash: string): Promise<any>;

    /**
     * Helper function to get attestation from a BAP API server
     *
     * @param apiUrl
     * @param apiData
     * @returns {Promise<any>}
     */
    getApiData(apiUrl: string, apiData: any): Promise<any>;
  }
}
