/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/marketplace.json`.
 */
export type Marketplace = {
    "address": "FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE",
    "metadata": {
      "name": "marketplace",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "addFeedToListing",
        "discriminator": [
          190,
          229,
          59,
          141,
          250,
          119,
          245,
          29
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "feed",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "confirmParking",
        "discriminator": [
          37,
          10,
          125,
          219,
          52,
          235,
          191,
          25
        ],
        "accounts": [
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "sensorId",
            "type": "string"
          }
        ]
      },
      {
        "name": "deleteListing",
        "discriminator": [
          59,
          198,
          212,
          192,
          16,
          75,
          102,
          144
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "owner",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "arg",
                  "path": "name"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "fee",
            "type": "u32"
          }
        ]
      },
      {
        "name": "list",
        "discriminator": [
          54,
          174,
          193,
          67,
          17,
          41,
          132,
          38
        ],
        "accounts": [
          {
            "name": "maker",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "address",
            "type": "string"
          },
          {
            "name": "rentalRate",
            "type": "u32"
          },
          {
            "name": "sensorId",
            "type": "string"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "additionalInfo",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "availabiltyStart",
            "type": "i64"
          },
          {
            "name": "availabiltyEnd",
            "type": "i64"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "phone",
            "type": "string"
          }
        ]
      },
      {
        "name": "reserve",
        "discriminator": [
          92,
          99,
          244,
          209,
          28,
          65,
          213,
          157
        ],
        "accounts": [
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "sensorChange",
        "discriminator": [
          70,
          128,
          70,
          160,
          17,
          22,
          191,
          226
        ],
        "accounts": [
          {
            "name": "feed"
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true,
            "signer": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "setNotificationSettings",
        "discriminator": [
          109,
          184,
          24,
          245,
          42,
          38,
          220,
          73
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "notification",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "app",
            "type": "bool"
          },
          {
            "name": "email",
            "type": "bool"
          },
          {
            "name": "phone",
            "type": "bool"
          }
        ]
      },
      {
        "name": "updateListing",
        "discriminator": [
          192,
          174,
          210,
          68,
          116,
          40,
          242,
          253
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "owner",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "address",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "rentalRate",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "sensorId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "latitude",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "longitude",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "additionalInfo",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "availabiltyStart",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "availabiltyEnd",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "email",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "phone",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "listing",
        "discriminator": [
          218,
          32,
          50,
          73,
          43,
          134,
          26,
          58
        ]
      },
      {
        "name": "marketplace",
        "discriminator": [
          70,
          222,
          41,
          62,
          78,
          3,
          32,
          174
        ]
      },
      {
        "name": "notificationSettings",
        "discriminator": [
          39,
          85,
          143,
          237,
          251,
          134,
          128,
          211
        ]
      }
    ],
    "events": [
      {
        "name": "parkingConfirmed",
        "discriminator": [
          12,
          6,
          179,
          109,
          91,
          71,
          225,
          2
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "customError",
        "msg": "Custom error message"
      },
      {
        "code": 6001,
        "name": "unauthorized",
        "msg": "Unauthorized access."
      },
      {
        "code": 6002,
        "name": "listingNotAvailable",
        "msg": "The listing is not available for reservation."
      },
      {
        "code": 6003,
        "name": "insufficientFunds",
        "msg": "Insufficient funds"
      }
    ],
    "types": [
      {
        "name": "listing",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "maker",
              "type": "pubkey"
            },
            {
              "name": "email",
              "type": "string"
            },
            {
              "name": "phone",
              "type": "string"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "address",
              "type": "string"
            },
            {
              "name": "latitude",
              "type": "f64"
            },
            {
              "name": "longitude",
              "type": "f64"
            },
            {
              "name": "rentalRate",
              "type": "u32"
            },
            {
              "name": "availabiltyStart",
              "type": "i64"
            },
            {
              "name": "availabiltyEnd",
              "type": "i64"
            },
            {
              "name": "sensorId",
              "type": "string"
            },
            {
              "name": "reservedBy",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "reservationStart",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "reservationEnd",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "parkingSpaceStatus",
              "type": {
                "defined": {
                  "name": "parkingSpaceStatus"
                }
              }
            },
            {
              "name": "additionalInfo",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "feed",
              "type": {
                "option": "pubkey"
              }
            }
          ]
        }
      },
      {
        "name": "marketplace",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "fee",
              "type": "u32"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "name",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "notificationSettings",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "app",
              "type": "bool"
            },
            {
              "name": "text",
              "type": "bool"
            },
            {
              "name": "email",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "parkingConfirmed",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "listingId",
              "type": "pubkey"
            },
            {
              "name": "sensorId",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "parkingSpaceStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "available"
            },
            {
              "name": "reserved"
            },
            {
              "name": "occupied"
            },
            {
              "name": "unAvailable"
            }
          ]
        }
      }
    ]
  };
  

  ///IDL
  /**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/marketplace.json`.
 */
  export const IDL: Marketplace = {
    "address": "FXUQwDsKJNrYFsfiUokPbH4BSrZtoC9m8HpoiMvYxtSE",
    "metadata": {
      "name": "marketplace",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "addFeedToListing",
        "discriminator": [
          190,
          229,
          59,
          141,
          250,
          119,
          245,
          29
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "feed",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "confirmParking",
        "discriminator": [
          37,
          10,
          125,
          219,
          52,
          235,
          191,
          25
        ],
        "accounts": [
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "sensorId",
            "type": "string"
          }
        ]
      },
      {
        "name": "deleteListing",
        "discriminator": [
          59,
          198,
          212,
          192,
          16,
          75,
          102,
          144
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "owner",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "admin",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "arg",
                  "path": "name"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "fee",
            "type": "u32"
          }
        ]
      },
      {
        "name": "list",
        "discriminator": [
          54,
          174,
          193,
          67,
          17,
          41,
          132,
          38
        ],
        "accounts": [
          {
            "name": "maker",
            "writable": true,
            "signer": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "address",
            "type": "string"
          },
          {
            "name": "rentalRate",
            "type": "u32"
          },
          {
            "name": "sensorId",
            "type": "string"
          },
          {
            "name": "latitude",
            "type": "f64"
          },
          {
            "name": "longitude",
            "type": "f64"
          },
          {
            "name": "additionalInfo",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "availabiltyStart",
            "type": "i64"
          },
          {
            "name": "availabiltyEnd",
            "type": "i64"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "phone",
            "type": "string"
          }
        ]
      },
      {
        "name": "reserve",
        "discriminator": [
          92,
          99,
          244,
          209,
          28,
          65,
          213,
          157
        ],
        "accounts": [
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "sensorChange",
        "discriminator": [
          70,
          128,
          70,
          160,
          17,
          22,
          191,
          226
        ],
        "accounts": [
          {
            "name": "feed"
          },
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true,
            "signer": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "renter",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "setNotificationSettings",
        "discriminator": [
          109,
          184,
          24,
          245,
          42,
          38,
          220,
          73
        ],
        "accounts": [
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "notification",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "app",
            "type": "bool"
          },
          {
            "name": "email",
            "type": "bool"
          },
          {
            "name": "phone",
            "type": "bool"
          }
        ]
      },
      {
        "name": "updateListing",
        "discriminator": [
          192,
          174,
          210,
          68,
          116,
          40,
          242,
          253
        ],
        "accounts": [
          {
            "name": "marketplace",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    109,
                    97,
                    114,
                    107,
                    101,
                    116,
                    112,
                    108,
                    97,
                    99,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "marketplace.name",
                  "account": "marketplace"
                }
              ]
            }
          },
          {
            "name": "maker",
            "writable": true
          },
          {
            "name": "listing",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "marketplace"
                },
                {
                  "kind": "account",
                  "path": "maker"
                }
              ]
            }
          },
          {
            "name": "owner",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "address",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "rentalRate",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "sensorId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "latitude",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "longitude",
            "type": {
              "option": "f64"
            }
          },
          {
            "name": "additionalInfo",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "availabiltyStart",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "availabiltyEnd",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "email",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "phone",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "listing",
        "discriminator": [
          218,
          32,
          50,
          73,
          43,
          134,
          26,
          58
        ]
      },
      {
        "name": "marketplace",
        "discriminator": [
          70,
          222,
          41,
          62,
          78,
          3,
          32,
          174
        ]
      },
      {
        "name": "notificationSettings",
        "discriminator": [
          39,
          85,
          143,
          237,
          251,
          134,
          128,
          211
        ]
      }
    ],
    "events": [
      {
        "name": "parkingConfirmed",
        "discriminator": [
          12,
          6,
          179,
          109,
          91,
          71,
          225,
          2
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "customError",
        "msg": "Custom error message"
      },
      {
        "code": 6001,
        "name": "unauthorized",
        "msg": "Unauthorized access."
      },
      {
        "code": 6002,
        "name": "listingNotAvailable",
        "msg": "The listing is not available for reservation."
      },
      {
        "code": 6003,
        "name": "insufficientFunds",
        "msg": "Insufficient funds"
      }
    ],
    "types": [
      {
        "name": "listing",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "maker",
              "type": "pubkey"
            },
            {
              "name": "email",
              "type": "string"
            },
            {
              "name": "phone",
              "type": "string"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "address",
              "type": "string"
            },
            {
              "name": "latitude",
              "type": "f64"
            },
            {
              "name": "longitude",
              "type": "f64"
            },
            {
              "name": "rentalRate",
              "type": "u32"
            },
            {
              "name": "availabiltyStart",
              "type": "i64"
            },
            {
              "name": "availabiltyEnd",
              "type": "i64"
            },
            {
              "name": "sensorId",
              "type": "string"
            },
            {
              "name": "reservedBy",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "reservationStart",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "reservationEnd",
              "type": {
                "option": "i64"
              }
            },
            {
              "name": "parkingSpaceStatus",
              "type": {
                "defined": {
                  "name": "parkingSpaceStatus"
                }
              }
            },
            {
              "name": "additionalInfo",
              "type": {
                "option": "string"
              }
            },
            {
              "name": "feed",
              "type": {
                "option": "pubkey"
              }
            }
          ]
        }
      },
      {
        "name": "marketplace",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "type": "pubkey"
            },
            {
              "name": "fee",
              "type": "u32"
            },
            {
              "name": "bump",
              "type": "u8"
            },
            {
              "name": "name",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "notificationSettings",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "app",
              "type": "bool"
            },
            {
              "name": "text",
              "type": "bool"
            },
            {
              "name": "email",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "parkingConfirmed",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "listingId",
              "type": "pubkey"
            },
            {
              "name": "sensorId",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "parkingSpaceStatus",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "available"
            },
            {
              "name": "reserved"
            },
            {
              "name": "occupied"
            },
            {
              "name": "unAvailable"
            }
          ]
        }
      }
    ]
  };
  