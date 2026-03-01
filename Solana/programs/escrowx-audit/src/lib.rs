use anchor_lang::prelude::*;

declare_id!("6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj");

#[program]
pub mod escrowx_audit {
    use super::*;

    /// Creates a lifecycle record for an Ethereum escrow event
    pub fn write_lifecycle_record(
        ctx: Context<WriteLifecycleRecord>,
        listing_id: u64,
        eth_tx_hash: String,
        actor: Pubkey,
        amount: u64,
    ) -> Result<()> {
        // Validate eth_tx_hash length
        require!(eth_tx_hash.len() <= 100, ErrorCode::EthTxHashTooLong);

        let escrow_record = &mut ctx.accounts.escrow_record;
        escrow_record.listing_id = listing_id;
        escrow_record.record_type = 0; // Lifecycle record
        escrow_record.eth_tx_hash = eth_tx_hash;
        escrow_record.actor = actor;
        escrow_record.amount = amount;
        escrow_record.proof_hash = None;
        escrow_record.timestamp = Clock::get()?.unix_timestamp;

        msg!("Lifecycle record created for listing_id: {}, amount: {}", listing_id, amount);
        Ok(())
    }

    /// Creates a dispute record for an Ethereum escrow event
    pub fn write_dispute_record(
        ctx: Context<WriteDisputeRecord>,
        listing_id: u64,
        eth_tx_hash: String,
        actor: Pubkey,
        proof_hash: String,
    ) -> Result<()> {
        // Validate input lengths
        require!(eth_tx_hash.len() <= 100, ErrorCode::EthTxHashTooLong);
        require!(proof_hash.len() <= 100, ErrorCode::ProofHashTooLong);

        let escrow_record = &mut ctx.accounts.escrow_record;
        escrow_record.listing_id = listing_id;
        escrow_record.record_type = 1; // Dispute record
        escrow_record.eth_tx_hash = eth_tx_hash;
        escrow_record.actor = actor;
        escrow_record.amount = 0; // Not used in dispute records
        escrow_record.proof_hash = Some(proof_hash);
        escrow_record.timestamp = Clock::get()?.unix_timestamp;

        msg!("Dispute record created for listing_id: {}", listing_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct WriteLifecycleRecord<'info> {
    #[account(
        init,
        payer = signer,
        space = EscrowRecord::LEN
    )]
    pub escrow_record: Account<'info, EscrowRecord>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WriteDisputeRecord<'info> {
    #[account(
        init,
        payer = signer,
        space = EscrowRecord::LEN
    )]
    pub escrow_record: Account<'info, EscrowRecord>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowRecord {
    pub listing_id: u64,        // 8 bytes
    pub record_type: u8,        // 1 byte (0 = Lifecycle, 1 = Dispute)
    pub eth_tx_hash: String,    // 4 + 100 bytes (String with max 100 chars)
    pub actor: Pubkey,          // 32 bytes
    pub amount: u64,            // 8 bytes
    pub proof_hash: Option<String>, // 1 + 4 + 100 bytes (Option<String> with max 100 chars)
    pub timestamp: i64,         // 8 bytes
}

impl EscrowRecord {
    // Calculate account space: discriminator (8) + struct fields
    // listing_id (8) + record_type (1) + eth_tx_hash (4 + 100) + actor (32) + 
    // amount (8) + proof_hash (1 + 4 + 100) + timestamp (8)
    pub const LEN: usize = 8 + 8 + 1 + 4 + 100 + 32 + 8 + 1 + 4 + 100 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Ethereum transaction hash is too long (max 100 characters)")]
    EthTxHashTooLong,
    #[msg("Proof hash is too long (max 100 characters)")]
    ProofHashTooLong,
}