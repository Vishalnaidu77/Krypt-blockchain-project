import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constance';

export const TransactionContext = createContext();

const { ethereum } = window;

const getEthereumContract = async () => { // Add async
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner(); // Add await
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState('')
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"))

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}))
    }

    const checkIfWalletIsConnected = async () => {

        try {
            if(!ethereum) return alert("Please install metamask")
    
            const account = await ethereum.request({ method: 'eth_accounts'})
            
            if(account.length) {
                setCurrentAccount(account[0])
            } else {
                console.log("No accounts found");
                
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }

        
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask")
            const account = await ethereum.request({ method: 'eth_requestAccounts'})

            setCurrentAccount(account[0])
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }

    const sendTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            
            const { addressTo, amount, keyword, message } = formData;   
            const transactionContract = await getEthereumContract(); // Add await
            const parsedAmount = ethers.parseEther(amount);
            
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount.toString() // Change from ._hex to .toString()
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(
                addressTo, 
                parsedAmount, 
                message, 
                keyword
            );

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toString()); // Change from .toNumber() to .toString()
            
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    })

    return(
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransactions }}>
            {children}
        </TransactionContext.Provider>
    )
}