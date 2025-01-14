import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { LunchPad } from "./LunchPad";

const NEXT_A_SOL_URL =
 

const Home = () => {
  return (
    <div>
      <ConnectionProvider endpoint={NEXT_A_SOL_URL}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="flex flex-col ">
              <div className="flex  p-4 fixed top-2 gap-5  justify-between">
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <LunchPad />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};

export default Home;
