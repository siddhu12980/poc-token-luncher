import React, { useState, useCallback } from "react";
import { toast, Toaster } from "sonner";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMint,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { Coins, ImagePlus, Type, Coins as CoinsIcon } from "lucide-react";

export function LunchPad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [image, setImage] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [mintKeypair, setMintKeypair] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const createToken = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!name || !symbol || !image || !initialSupply) {
        toast.error("All fields are required");
        return;
      }

      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      setMintKeypair(mintKeypair);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintKeypair.publicKey,
          9,
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.partialSign(mintKeypair);

      await wallet.sendTransaction(transaction, connection);
      toast.success("Token mint created successfully");
    } catch (error) {
      toast.error("Failed to create token: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [name, symbol, image, initialSupply, connection, wallet]);

  const mintToken = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!wallet.publicKey) {
        toast.error("Please connect your wallet first");
        return;
      }

      if (!mintKeypair) {
        toast.error("Please create a token mint first");
        return;
      }

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          mintKeypair.publicKey
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          Number(initialSupply) * Math.pow(10, 9)
        )
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      toast.success("Token minted successfully");
    } catch (error) {
      toast.error("Failed to mint token: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [mintKeypair, initialSupply, connection, wallet]);

  return (
    <div className="flex  justify-center items-center bg-black text-white gap-5">
      <div className="mx-auto  flex flex-col gap-5 ">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold ">
            Solana Token Launchpad
          </h2>
          <p className="mt-2 text-sm ">
            Create and mint your own  token
          </p>
        </div>

        <div className=" rounded-lg shadow flex flex-col gap-5 p-5 ">
          
            <div className="relative">
              <div className="flex items-center">
                <Type className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Token Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-md outline-none "
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Token Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-md  outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center">
                <ImagePlus className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Token Image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-md  outline-none"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center">
                <CoinsIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Initial Supply"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-md  outline-none "
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 ">
            <button
              onClick={createToken}
              disabled={isLoading || !wallet.publicKey}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Token"}
            </button>

            <button
              onClick={mintToken}
              disabled={isLoading || !wallet.publicKey || !mintKeypair}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Minting..." : "Mint Tokens"}
            </button>
          </div>

          {!wallet.publicKey && (
            <p className="text-center text-sm text-red-600">
              Please connect your wallet to create and mint tokens
            </p>
          )}

      </div>
      <Toaster />
    </div>
  );
}