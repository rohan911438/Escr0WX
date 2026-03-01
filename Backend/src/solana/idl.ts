import { IdlAccounts, IdlTypes } from '@project-serum/anchor';

export const EscrowXAuditIDL = {
  "version": "0.1.0",
  "name": "escrowx_audit",
  "instructions": [
    {
      "name": "writeLifecycleRecord",
      "accounts": [
        {
          "name": "escrowRecord",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "listingId",
          "type": "u64"
        },
        {
          "name": "ethTxHash",
          "type": "string"
        },
        {
          "name": "actor",
          "type": "publicKey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "writeDisputeRecord",
      "accounts": [
        {
          "name": "escrowRecord",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "listingId",
          "type": "u64"
        },
        {
          "name": "ethTxHash",
          "type": "string"
        },
        {
          "name": "actor",
          "type": "publicKey"
        },
        {
          "name": "proofHash",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "EscrowRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "recordType",
            "type": "u8"
          },
          {
            "name": "ethTxHash",
            "type": "string"
          },
          {
            "name": "actor",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "proofHash",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "EthTxHashTooLong",
      "msg": "Ethereum transaction hash is too long (max 100 characters)"
    },
    {
      "code": 6001,
      "name": "ProofHashTooLong",
      "msg": "Proof hash is too long (max 100 characters)"
    }
  ]
} as const;

export type EscrowXAuditProgram = {
  version: "0.1.0";
  name: "escrowx_audit";
  instructions: [
    {
      name: "writeLifecycleRecord";
      accounts: [
        { name: "escrowRecord"; isMut: true; isSigner: true },
        { name: "signer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "listingId"; type: "u64" },
        { name: "ethTxHash"; type: "string" },
        { name: "actor"; type: "publicKey" },
        { name: "amount"; type: "u64" }
      ];
    },
    {
      name: "writeDisputeRecord";
      accounts: [
        { name: "escrowRecord"; isMut: true; isSigner: true },
        { name: "signer"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "listingId"; type: "u64" },
        { name: "ethTxHash"; type: "string" },
        { name: "actor"; type: "publicKey" },
        { name: "proofHash"; type: "string" }
      ];
    }
  ];
  accounts: [
    {
      name: "EscrowRecord";
      type: {
        kind: "struct";
        fields: [
          { name: "listingId"; type: "u64" },
          { name: "recordType"; type: "u8" },
          { name: "ethTxHash"; type: "string" },
          { name: "actor"; type: "publicKey" },
          { name: "amount"; type: "u64" },
          { name: "proofHash"; type: { option: "string" } },
          { name: "timestamp"; type: "i64" }
        ];
      };
    }
  ];
  errors: [
    { code: 6000; name: "EthTxHashTooLong"; msg: "Ethereum transaction hash is too long (max 100 characters)" },
    { code: 6001; name: "ProofHashTooLong"; msg: "Proof hash is too long (max 100 characters)" }
  ];
};

export type EscrowRecord = IdlAccounts<EscrowXAuditProgram>["EscrowRecord"];