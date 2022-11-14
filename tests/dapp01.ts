import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Dapp01 } from "../target/types/dapp01";

describe("dapp01", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Dapp01 as Program<Dapp01>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
