import JSEncrypt from 'jsencrypt';  // 导入 JSEncrypt 库

// 假设公钥是以下格式
const publicKey = import.meta.env.VITE_RSA_KEY

// 使用 jsrsasign 对数据进行加密
export function encryptDataWithPublicKey(data) {
  // 创建 JSEncrypt 实例
const encryptor = new JSEncrypt();

// 设置公钥
encryptor.setPublicKey(publicKey);


// 将数据转为 JSON 字符串
const jsonData = typeof data === 'object' ? JSON.stringify(data) : String(data);
console.log('JSON Data:', jsonData)

// 使用公钥加密
const encryptedData = encryptor.encrypt(jsonData);

// 加密后的数据（Base64 编码）
console.log('Encrypted Data:', encryptedData);
return encryptedData
}

