import { web3, utils } from '@project-serum/anchor';
import { findAssociatedTokenAddress } from '../../../common';
import { AUTHORIZATION_RULES_PROGRAM } from '../../constants';
import { findTokenRecordPda, getMetaplexMetadata, returnAnchorProgram } from '../../helpers';

type stopLiquidationRafflesByAdminParams = (params: {
  programId: web3.PublicKey;
  connection: web3.Connection;
  admin: web3.PublicKey;
  nftMint: web3.PublicKey;
  liquidationLot: web3.PublicKey;
  loan: web3.PublicKey;
}) => Promise<{ix: web3.TransactionInstruction}>;

export const stopLiquidationRaffles: stopLiquidationRafflesByAdminParams = async ({
  programId,
  connection,
  admin,
  nftMint,
  liquidationLot,
  loan,
}) => {
  const encoder = new TextEncoder();

  const program = returnAnchorProgram(programId, connection);
  const nftAdminTokenAccount = await findAssociatedTokenAddress(admin, nftMint);

  const [communityPoolsAuthority, bumpPoolsAuth] = await web3.PublicKey.findProgramAddress(
    [encoder.encode('nftlendingv2'), programId.toBuffer()],
    program.programId,
  );
  const vaultNftTokenAccount = await findAssociatedTokenAddress(communityPoolsAuthority, nftMint);
  const nftMetadata = getMetaplexMetadata(nftMint);
  const ownerTokenRecord = findTokenRecordPda(nftMint, vaultNftTokenAccount)
  const destTokenRecord = findTokenRecordPda(nftMint, nftAdminTokenAccount)


  const ix = await program.methods.stopLiquidationRafflesByAdmin(null).accountsStrict({
      admin,
      nftMint,
      communityPoolsAuthority,
      liquidationLot,
      loan,
      instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY, 
      nftMetadata, 
      ownerTokenRecord, 
      destTokenRecord,
      authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,
      vaultNftTokenAccount,
      nftAdminTokenAccount,
      tokenProgram: utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    }).instruction();
  return {ix}
};
