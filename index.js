export default {
    async email(message, env, ctx) {
        const { from, to, raw, headers } = message;

        const reader = raw.getReader();
        let chunks = [];

        try {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }

                if (!env.apiUrl) throw 'No "apiUrl" was provided by the server';

                const resp = await fetch(env.apiUrl, {
                    headers: {
                        ['Content-Type']: 'Application/json',
                        'x-api-secret': env.apiSecret
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        from,
                        to,
                        forwarded: {
                            header: objectifyHeader(headers),
                            body: arrayBufferToBase64(concatenateChunks(chunks))
                        }
                    })
                });
                if (resp.status !== 200) throw (await resp.text()) || '';
            } catch (e) {
                message.setReject(`${e}`);
            }
        } finally {
            reader.releaseLock();
        }
    }
}

const objectifyHeader = (header) => {
    const obj = {};
    if (header instanceof Headers)
        header.forEach((v, k) => {
            obj[k] = v;
        });
    return obj;
}

function concatenateChunks(chunks) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const concatenatedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedBuffer.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
    }
    return concatenatedBuffer.buffer;
}

function arrayBufferToBase64(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}
