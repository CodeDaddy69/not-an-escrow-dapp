// async function userStats() {

//     const [statsPDA, _bump] = PublicKey.findProgramAddressSync([
//         anchor.utils.bytes.utf8.encode("user_stats"),
//         program.provider.publicKey.toBuffer(),
//       ], 
//       program.programId
//       );

//     try {
//         const stats = await program.account.userStats.fetch(statsPDA);
//     } catch(err) {
//         console.log(err)
//     }
// }

export {}