import * as ethers from "ethers";
import logger from "./logger.js";
import {SCAN_LINKS} from "./constants.js";
import {Network} from "./interfaces.js";

export async function handleResponse(
    receipt: ethers.providers.TransactionReceipt,
    walletNumber: number,
    network: Network,
    message?: string
): Promise<[ethers.providers.TransactionReceipt, boolean]> {
    return await retry(async () => {
        try {
            if (receipt && receipt.status === 1) {
                const logMessage = message ? `${message} | ` : '';
                logger.success(`| ${walletNumber} | ${logMessage} ${SCAN_LINKS[network]}${receipt.transactionHash}`);
                return [receipt, true];
            } else {
                const errorMessage = `| ${walletNumber} | Transaction failed`;
                logger.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = `| ${walletNumber} | Error while sending transaction: ${error.message}`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    });
}


export async function retry<T>(fn: () => Promise<T>, retries = 1, delay = 5000): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            if (i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
    throw lastError ?? new Error("Retries exhausted with unknown error");
}
