import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Image from 'next/image';
import React from 'react';
import styles from '../styles/Home.module.css';
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import type { Idl, Address } from "@coral-xyz/anchor";
import idl from '../lib/idl/idl.json';
import address from '../lib/idl/idl_address.json';
import { 
    InitialiseUserButton, FundTokenAccount, 
    ItemSentButton, BuyerReceivedButton,
    Testbutton } from '../components/buttons';
import { ListingForm } from '../components/listingForm';
import { DisplayListing } from '../components/displayListing';
import { web3 } from '@coral-xyz/anchor';



const WalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);


const Home: NextPage = () => {
    

    function getProvider(wallet: AnchorWallet | undefined) {
        if (!wallet) return undefined;
    
        const network = "https://api.testnet.solana.com";
        const connection = new Connection(network, "confirmed");
    
        const provider = new AnchorProvider(
            connection, wallet, {}
        );
        return provider;
    }
    
    function getProgram(idl: any, address: Address, wallet: AnchorWallet | undefined) {
        if (!getProvider(wallet)) return undefined;

        const provider = getProvider(wallet);
    
        const a = JSON.stringify(idl);
        const b: Idl = JSON.parse(a);
        console.log(b);
        console.log(typeof b);

        const program = new Program(b, address, provider);
        return program;
    }


    const wallet = useAnchorWallet();
    // const provider = getProvider(wallet);
    const program = getProgram(idl, address.address, wallet);

    const amount = 100
    const accounts = {
        mint: new web3.PublicKey("2hiumqn5Qmr18AjmMNkbbmzYXAVsBt8EPM2AkyjmhiXQ"),
        account: new web3.PublicKey("CXy5YKuTCTJouSPGidbu8zMSV61dvyBkQyzhZEH8NqjT")
    }



    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <div className={styles.walletButtons}>
                    <WalletMultiButtonDynamic />
                    <WalletDisconnectButtonDynamic />
                    {/* <CreateMintButton program={program} /> */}
                    <InitialiseUserButton program={program}/>
                    <FundTokenAccount program={program} accounts={accounts} amount={amount}/>
                </div>
                <div>
                    <ListingForm program={program}/>
                </div>
                <div>
                    <DisplayListing program={program} account={"8PicuETn3oTfcv1JQzxszzD4A4ecsqz3NdJKpYXmW8VJ"} id={229587561}/>
                </div>
                <div className={styles.walletButtons}>
                    <ItemSentButton program={program} escrow={new web3.PublicKey("HDoTn44V1onEf8yxVe2HKNdLVEP1uYRzcNW6cN8R9uTm")}/>
                    <BuyerReceivedButton 
                    program={program} 
                    escrow={new web3.PublicKey("HDoTn44V1onEf8yxVe2HKNdLVEP1uYRzcNW6cN8R9uTm")}
                    mint={new web3.PublicKey("2hiumqn5Qmr18AjmMNkbbmzYXAVsBt8EPM2AkyjmhiXQ")}
                    toDispute={false}
                    />
                    <Testbutton program={program}/>
                </div>
            </main>
        </div>
    );
};

export default Home;