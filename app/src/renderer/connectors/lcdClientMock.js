"use strict"
const b32 = require("../scripts/b32.js")
const { getHeight } = require("./rpcWrapperMock.js")

const botAddress = "cosmosaccaddr1p6zajjw6xged056andyhn62lm7axwzyspkzjq0"
const addresses = [
  "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
  "cosmosaccaddr1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546",
  botAddress
]
const validators = [
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n"
]
let state = {
  keys: [
    {
      name: "default",
      password: "1234567890",
      address: addresses[0]
    }
  ],
  accounts: {
    [addresses[0]]: {
      coins: [
        {
          denom: "mycoin",
          amount: "1000"
        },
        {
          denom: "fermion",
          amount: "2300"
        },
        {
          denom: "steak",
          amount: "1000"
        }
      ],
      sequence: "1",
      account_number: "1"
    }
  },
  nonces: { [addresses[0]]: 0 },
  txs: [
    {
      tx: {
        value: {
          msg: [
            {
              type: "cosmos-sdk/Send",
              value: {
                inputs: [
                  {
                    coins: [
                      {
                        denom: "jbcoins",
                        amount: "1234"
                      }
                    ],
                    address: makeHash()
                  }
                ],
                outputs: [
                  {
                    coins: [
                      {
                        denom: "jbcoins",
                        amount: "1234"
                      }
                    ],
                    address: addresses[0]
                  }
                ]
              }
            }
          ]
        }
      },
      hash: "999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A",
      height: 1
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: "cosmos-sdk/Send",
              value: {
                inputs: [
                  {
                    coins: [
                      {
                        denom: "fabocoins",
                        amount: "1234"
                      }
                    ],
                    address: addresses[0]
                  }
                ],
                outputs: [
                  {
                    coins: [
                      {
                        denom: "fabocoins",
                        amount: "1234"
                      }
                    ],
                    address: makeHash()
                  }
                ]
              }
            }
          ]
        }
      },
      hash: "A7C6DE5CA923AF08E6088F1348047F16BABB9F48",
      height: 150
    }
  ],
  stake: {
    [addresses[0]]: {
      delegations: [
        {
          delegator_addr: addresses[0],
          validator_addr: validators[0],
          shares: "14",
          height: 123
        }
      ],
      unbonding_delegations: []
    }
  },
  candidates: [
    {
      owner: validators[0],
      pub_key: {
        type: "AC26791624DE60",
        data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk="
      },
      revoked: false,
      tokens: "14",
      delegator_shares: "14",
      description: {
        description: "Mr Mounty",
        moniker: "mr_mounty",
        country: "Canada"
      },
      status: 2,
      bond_height: "0",
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: "0",
      commission_max: "0",
      commission_change_rate: "0",
      commission_change_today: "0",
      prev_bonded_shares: "0"
    },
    {
      owner: validators[1],
      pub_key: {
        type: "AC26791624DE60",
        data: "9M4oaDArXKVU5ffqjq2TkynTCMJlyLzpzZLNjHtqM+w="
      },
      tokens: "0",
      delegator_shares: "0",
      description: {
        description: "Good Guy Greg",
        moniker: "good_greg",
        country: "USA"
      },
      status: 2,
      bond_height: "0",
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: "0",
      commission_max: "0",
      commission_change_rate: "0",
      commission_change_today: "0",
      prev_bonded_shares: "0"
    },
    {
      owner: validators[2],
      pub_key: {
        type: "AC26791624DE60",
        data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
      },
      tokens: "19",
      delegator_shares: "19",
      description: {
        description: "Herr Schmidt",
        moniker: "herr_schmidt_revoked",
        country: "DE"
      },
      revoked: true,
      status: 2,
      bond_height: "0",
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: "0",
      commission_max: "0",
      commission_change_rate: "0",
      commission_change_today: "0",
      prev_bonded_shares: "0"
    }
  ],
  sendHeight: 2
}

module.exports = {
  candidates: state.candidates,

  async lcdConnected() {
    return true
  },

  // keys
  async generateSeed() {
    return "grace admit inherit female grant pledge shine inquiry pencil acid capable damage elegant voice aunt abandon grace admit inherit female grant pledge shine inquiry"
  },
  async storeKey({ name, password, seed }) {
    let key = {
      name,
      password,
      address: makeHash()
    }
    state.keys.push(key)
    return { name, password, seed, address: key.address }
  },
  async listKeys() {
    return state.keys.map(k => ({
      name: k.name,
      address: k.address
    }))
  },
  async getKey(name) {
    return state.keys.find(k => k.name === name)
  },
  async updateKey(account, { name, old_password, new_password }) {
    // eslint-disable-line camelcase
    let key = state.keys.find(k => k.name === name)
    if (key.password !== old_password) {
      // eslint-disable-line camelcase
      throw new Error("Passwords do not match")
    }
    key.password = new_password // eslint-disable-line camelcase
  },
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  async deleteKey(account, { name, password }) {
    let key = state.keys.find(k => k.name === name)
    if (key.password !== password) {
      throw new Error("Passwords do not match")
    }
    state.keys = state.keys.filter(k => k.name !== name)
  },

  // coins
  async queryAccount(address) {
    return state.accounts[address]
  },
  async txs(address) {
    return state.txs.filter(tx => {
      return (
        tx.tx.value.msg[0].value.inputs.find(
          input => input.address === address
        ) ||
        tx.tx.value.msg[0].value.outputs.find(
          output => output.address === address
        )
      )
    })
  },
  async tx(hash) {
    return state.txs.find(tx => tx.hash === hash)
  },
  async send(to, req) {
    let fromKey = state.keys.find(a => a.name === req.name)
    if (!fromKey)
      throw Error(
        "Key you want to send from does not exist in the lcd connection mock"
      )
    return send(to, fromKey.address, req)
  },
  ibcSend(to, req) {
    // XXX ignores chainId, treated as normal send
    to = to.split("/")[1]
    return module.exports.send(to, req)
  },

  // staking
  async updateDelegations(
    delegatorAddr,
    { name, sequence, delegations, begin_unbondings }
  ) {
    let results = []
    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]
    if (fromAccount == null) {
      results.push(txResult(1, "Nonexistent account"))
      return results
    }
    // check nonce
    if (parseInt(fromAccount.sequence) !== parseInt(sequence)) {
      results.push(
        txResult(
          2,
          `Expected sequence "${fromAccount.sequence}", got "${sequence}"`
        )
      )
      return results
    }
    for (let tx of delegations) {
      let { denom } = tx.delegation
      let amount = parseInt(tx.delegation.amount)
      if (amount < 0) {
        results.push(txResult(1, "Amount cannot be negative"))
        return results
      }
      if (fromAccount.coins.find(c => c.denom === denom).amount < amount) {
        results.push(txResult(1, "Not enough coins in your account"))
        return results
      }
      // update sender account
      incrementSequence(fromAccount)
      fromAccount.coins.find(c => c.denom === denom).amount -= amount
      // update stake
      let delegator = state.stake[fromKey.address]
      if (!delegator) {
        state.stake[fromKey.address] = {
          delegations: [],
          unbonding_delegations: []
        }
        delegator = state.stake[fromKey.address]
      }
      let delegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_addr
      )
      if (!delegation) {
        delegation = {
          delegator_addr: fromKey.address,
          validator_addr: tx.validator_addr,
          shares: "0",
          height: 0
        }
        delegator.delegations.push(delegation)
      }

      let shares = parseInt(delegation.shares)
      delegation.shares = (shares + amount).toString()
      let candidate = state.candidates.find(c => c.owner === tx.validator_addr)
      if (candidate.revoked) {
        throw new Error(`checkTx failed: (262245) Msg 0 failed: === ABCI Log ===
  Codespace: 4
  Code:      101
  ABCICode:  262245
  Error:     --= Error =--
  Data: common.FmtError{format:"validator for this address is currently revoked", args:[]interface {}(nil)}
  Msg Traces:
  --= /Error =--

  === /ABCI Log ===`)
      }

      candidate.tokens = (parseInt(candidate.tokens) + amount).toString()
      candidate.delegator_shares = (
        parseInt(candidate.delegator_shares) + amount
      ).toString()

      storeTx("cosmos-sdk/MsgDelegate", tx)
      results.push(txResult(0))
    }

    for (let tx of begin_unbondings) {
      incrementSequence(fromAccount)

      let amount = parseInt(tx.shares)

      // update sender balance
      let coinBalance = fromAccount.coins.find(c => c.denom === "steak")
      coinBalance.amount = String(parseInt(coinBalance) + amount)

      // update stake
      let delegator = state.stake[fromKey.address]
      if (!delegator) {
        results.push(txResult(2, "Nonexistent delegator"))
        return results
      }
      let delegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_addr
      )
      if (!delegation) {
        results.push(txResult(2, "Nonexistent delegation"))
        return results
      }
      let shares = parseInt(delegation.shares)
      delegation.shares = (+shares - amount).toString()

      let candidate = state.candidates.find(c => c.owner === tx.validator_addr)
      shares = parseInt(candidate.tokens)
      candidate.tokens = (+shares - amount).toString()
      delegator.unbonding_delegations.push(
        Object.assign({}, tx, {
          balance: {
            amount: tx.shares
          }
        })
      )

      storeTx("cosmos-sdk/BeginUnbonding", tx)
      results.push(txResult(0))
    }

    return results
  },
  async queryDelegation(delegatorAddress, validatorAddress) {
    let delegator = state.stake[delegatorAddress]
    if (!delegator) return {}
    return delegator.delegations.find(
      ({ validator_addr }) => validator_addr === validatorAddress
    )
  },
  async queryUnbonding(delegatorAddress, validatorAddress) {
    let delegator = state.stake[delegatorAddress]
    if (!delegator) return
    return delegator.unbonding_delegations.find(
      d => d.validator_addr === validatorAddress
    )
  },
  // Get all delegations information from a delegator
  getDelegator(delegatorAddress) {
    let delegator = state.stake[delegatorAddress] || {}
    return delegator
  },
  getDelegatorTxs(addr, types = []) {
    if (types.length === 0) types = ["bonding", "unbonding"]
    types = types.map(type => {
      if (type === "bonding") return "cosmos-sdk/MsgDelegate"
      if (type === "unbonding") return "cosmos-sdk/BeginUnbonding"
    })
    return getTxs(types)
  },
  async getCandidates() {
    return state.candidates
  },
  async getValidatorSet() {
    return {
      block_height: 1,
      validators: state.candidates
    }
  },
  async getCandidate(addr) {
    return state.candidates.find(c => c.owner === addr)
  },
  // exports to be used in tests
  state,
  addresses,
  validators
}

function makeHash() {
  var text = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  for (var i = 0; i < 40; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return b32.encode(text)
}

function send(to, from, req) {
  let fromAccount = state.accounts[from]
  if (fromAccount == null) {
    return txResult(1, "Nonexistent account")
  }

  for (let { denom, amount } of req.amount) {
    if (parseInt(amount) < 0) {
      return txResult(1, "Amount cannot be negative")
    }
    if (
      fromAccount.coins.find(c => c.denom === denom).amount < parseInt(amount)
    ) {
      return txResult(1, "Not enough coins in your account")
    }
  }

  // check/update nonce
  if (parseInt(fromAccount.sequence) !== parseInt(req.sequence)) {
    return txResult(
      2,
      `Expected sequence "${fromAccount.sequence}", got "${req.sequence}"`
    )
  }
  incrementSequence(fromAccount)

  // update sender balances
  for (let { denom, amount } of req.amount) {
    let senderBalance = fromAccount.coins.find(c => c.denom === denom)
    senderBalance.amount = String(
      parseInt(senderBalance.amount) - parseInt(amount)
    )
  }

  // update receiver balances
  let receiverAccount = state.accounts[to]
  if (!receiverAccount) {
    receiverAccount = state.accounts[to] = {
      coins: [],
      sequence: "0"
    }
  }
  for (let { denom, amount } of req.amount) {
    let receiverBalance = receiverAccount.coins.find(c => c.denom === denom)
    if (!receiverBalance) {
      receiverBalance = { amount: "0", denom }
      receiverAccount.coins.push(receiverBalance)
    }
    receiverBalance.amount = String(
      parseInt(receiverBalance.amount) + parseInt(amount)
    )
  }

  // log tx
  storeTx("cosmos-sdk/Send", {
    inputs: [
      {
        coins: req.amount,
        address: from
      }
    ],
    outputs: [
      {
        coins: req.amount,
        address: to
      }
    ]
  })

  // if receiver is bot address, send money back
  if (to === botAddress) {
    send(from, botAddress, {
      amount: req.amount,
      sequence: state.accounts[botAddress].sequence
    })
  }

  return txResult(0)
}

function storeTx(type, body) {
  state.txs.push({
    tx: {
      value: {
        msg: [
          {
            type,
            value: body
          }
        ]
      }
    },
    hash: makeHash(),
    height: getHeight(),
    time: Date.now()
  })
}

function getTxs(types) {
  return state.txs.filter(tx => types.indexOf(tx.tx.value.msg[0].type) !== -1)
}

// function delegate (sender, { pub_key: { data: pubKey }, amount: delegation }) {
//   let delegate = state.delegates.find(d => d.pub_key.data === pubKey)
//   if (!delegate) {
//     return txResult(1, 'Delegator does not exist')
//   }
//
//   let fermions = state.accounts[sender].coins.find(c => c.denom === 'fermion')
//   if (!fermions) {
//     state.accounts[sender].coins.push({ denom: 'fermion', amount: 0 })
//     fermions = state.accounts[sender].coins.find(c => c.denom === 'fermion')
//   }
//   if (fermions.amount < delegation.amount) {
//     return txResult(1, 'Not enought fermions to stake')
//   }
//
//   // execute
//   fermions.amount -= delegation.amount
//   delegate.voting_power += delegation.amount
//   state.stake[sender][pubKey] = state.stake[sender][pubKey] || {
//     PubKey: { data: pubKey },
//     Shares: 0
//   }
//   state.stake[sender][pubKey].Shares += delegation.amount
//
//   return txResult()
// }

function txResult(code = 0, message = "") {
  return {
    check_tx: {
      code: code,
      data: "",
      log: message,
      gas: "0",
      fee: "0"
    },
    deliver_tx: {
      code: 0,
      data: "",
      log: "",
      tags: []
    },
    hash: "999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A",
    height: 0
  }
}

function incrementSequence(account) {
  account.sequence = (parseInt(account.sequence) + 1).toString()
}
