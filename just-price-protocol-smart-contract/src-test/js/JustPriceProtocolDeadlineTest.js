/*
 * Test for Just Price Protocol Smart Contract.
 * Copyright © 2018 by ABDK Consulting.
 * Author: Mikhail Vladimirov <mikhail.vladimirov@gmail.com>
 */

tests.push ({
  name: "JustPriceProtocolDeadline",
  steps: [
    { name: "Ensure there is at least one account: Alice",
      body: function (test) {
        while (!web3.eth.accounts || web3.eth.accounts.length < 1)
          personal.newAccount ("");

        test.alice = web3.eth.accounts [0];
      }},
    { name: "Ensure Alice has at least 5 ETH",
      precondition: function (test) {
        miner.start ();
        return web3.eth.getBalance (test.alice).gte (web3.toWei ("5", "ether"));
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice deploys five Wallet contracts: Bob, Carol, Dave, Elly, and Frank",
      body: function (test) {
        var walletCode = loadContractCode ("Wallet");
        test.walletContract = loadContract ("Wallet");

        personal.unlockAccount (test.alice, "");
        test.tx1 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx2 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx3 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx4 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
        test.tx5 = test.walletContract.new (
          {from: test.alice, data: walletCode, gas: 1000000}).
          transactionHash;
      }},
    { name: "Make sure contracts were deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (
          test.tx1, test.tx2, test.tx3, test.tx4, test.tx5);
      },
      body: function (test) {
        miner.stop ();

        test.bob = getDeployedContract ("Bob", test.walletContract, test.tx1);
        test.carol = getDeployedContract ("Carol", test.walletContract, test.tx2);
        test.dave = getDeployedContract ("Dave", test.walletContract, test.tx3);
        test.elly = getDeployedContract ("Elly", test.walletContract, test.tx4);
        test.frank = getDeployedContract ("Frank", test.walletContract, test.tx5);
      }},
    { name: "Alice deploys MyOrgonToken contract",
      body: function (test) {
        var myOrgonTokenCode = loadContractCode ("MyOrgonToken");
        test.myOrgonTokenContract = loadContract ("MyOrgonToken");

        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonTokenContract.new (
          {from: test.alice, data: myOrgonTokenCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.myOrgonToken = getDeployedContract (
          "MyOrgonToken",
          test.myOrgonTokenContract,
          test.tx);
      }},
    { name: "Alice deploys MyOrisSpace contract",
      body: function (test) {
        var myOrisSpaceCode = loadContractCode ("MyOrisSpace");
        test.myOrisSpaceContract = loadContract ("MyOrisSpace");

        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrisSpaceContract.new (
          {from: test.alice, data: myOrisSpaceCode, gas:1000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.myOrisSpace = getDeployedContract (
          "MyOrisSpace",
          test.myOrisSpaceContract,
          test.tx);
      }},
    { name: "Alice deploys JustPriceProtocolWrapper contract",
      body: function (test) {
        var justPriceProtocolWrapperCode =
          loadContractCode ("JustPriceProtocolWrapper");
        test.justPriceProtocolWrapperContract =
          loadContract ("JustPriceProtocolWrapper");

        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapperContract.new (
          test.myOrgonToken.address,
          test.myOrisSpace.address,
          test.bob.address,
          {from: test.alice, data: justPriceProtocolWrapperCode, gas:3000000}).
          transactionHash;
      }},
    { name: "Make sure contract was deployed",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        test.justPriceProtocolWrapper = getDeployedContract (
          "JustPriceProtocolWrapper",
          test.justPriceProtocolWrapperContract,
          test.tx);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117599)',
          0, // BEFORE_RESERVE
          test.justPriceProtocolWrapper.getStage (1524117599));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1524117600)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1524117600));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531007999)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1531007999));

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531008000)',
          5, // REFUND
          test.justPriceProtocolWrapper.getStage (1531008000));
      }},
    { name: "Alice enables token transfers",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTransfersEnabled (
          1000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables token creation",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setCreationEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables token burning",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setBurningEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice enables Oris.Space start",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrisSpace.setStartEnabled (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Bob to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice tells Elly to accept payments",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.elly.setAcceptsPayments (
          true,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sets current time to one second before reserve deadline",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1531007999,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Alice sets total supply or Orgon tokens to 642118523.28",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.myOrgonToken.setTotalSupply (
          '642118523280000000',
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 39013.17467200000017 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531007999)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1531007999));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '0',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          0,
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('39013.17467200000017', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('39013.17467200000017', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '46702071779026999'
          });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx);

        assertEvents (
          "test.justPriceProtocolWrapper.Investment",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Investment,
          test.tx,
          {
            investor: test.bob.address,
            value: web3.toWei ('39013.17467200000017', 'ether'),
            amount: '46702071779026999'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '39013.17467200000017',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531007999)',
          1, // RESERVE
          test.justPriceProtocolWrapper.getStage (1531007999));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '46702071779026999',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets current time to reserve deadline",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1531008000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Carol initiates token delivery to Bob",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531008000)',
          2, // BEFORE_GROWTH
          test.justPriceProtocolWrapper.getStage (1531008000));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '46702071779026999',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.carol.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.deliver.getData (
            [ test.bob.address ]),
          0,
          {
            from: test.alice,
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.carol.Result",
          test.carol,
          test.carol.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrisSpace.Start",
          test.myOrisSpace,
          test.myOrisSpace.Start,
          test.tx,
          {
            initiator: test.justPriceProtocolWrapper.address,
            returnAmount: '298688848339026998'
          });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: '0x0000000000000000000000000000000000000000',
            _value: '298688848339026998'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '46702071779026999'
          });

        assertEvents (
          "test.justPriceProtocolWrapper.Delivery",
          test.justPriceProtocolWrapper,
          test.justPriceProtocolWrapper.Delivery,
          test.tx,
          {
            investor: test.bob.address,
            amount: '46702071779026999'
          });

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1531008000)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1531008000));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '46702071779026999',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets current time to one second before growth deadline",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1562543999,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 100000000 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1562543999)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1562543999));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '39013.17467200000017',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '46702071779026999',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '46702071779026999',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('100000000', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('100000000', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '465145863135153964'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '465099348548840449'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '46514586313515'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '100039013.17467200000017',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1562543999)',
          3, // GROWTH
          test.justPriceProtocolWrapper.getStage (1562543999));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '511847934914180963',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '511847934914180963',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }},
    { name: "Alice sets current time to growth deadline",
      body: function (test) {
        personal.unlockAccount (test.alice, "");
        test.tx = test.justPriceProtocolWrapper.setCurrentTime (
          1562544000,
          {from: test.alice, gas:1000000});
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();
      }},
    { name: "Bob buys tokens for 1 ether",
      body: function (test) {
        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1562544000)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1562544000));

        assertBalance (
          'test.justPriceProtocolWrapper',
          '100039013.17467200000017',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          0,
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '511847934914180963',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '511847934914180963',
          test.justPriceProtocolWrapper.totalEligibleVotes ());

        personal.unlockAccount (test.alice, "");
        test.tx = test.bob.execute (
          test.justPriceProtocolWrapper.address,
          test.justPriceProtocolWrapper.buyTokens.getData (),
          web3.toWei ('1', 'ether'),
          {
            from: test.alice,
            value: web3.toWei ('1', 'ether'),
            gas:1000000
          });
      }},
    { name: "Make sure transaction succeeded",
      precondition: function (test) {
        miner.start ();
        return transactionsExecuted (test.tx);
      },
      body: function (test) {
        miner.stop ();

        assertEvents (
          "test.bob.Result",
          test.bob,
          test.bob.Result,
          test.tx,
          { value: true });

        assertEvents (
          "test.myOrgonToken.Transfer",
          test.myOrgonToken,
          test.myOrgonToken.Transfer,
          test.tx,
          {
            _from: '0x0000000000000000000000000000000000000000',
            _to: test.justPriceProtocolWrapper.address,
            _value: '854944065'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '854858571'
          },
          {
            _from: test.justPriceProtocolWrapper.address,
            _to: test.bob.address,
            _value: '85494'
          });

        assertBalance (
          'test.justPriceProtocolWrapper',
          '100039014.17467200000017',
          'ether',
          test.justPriceProtocolWrapper.address);

        assertBalance (
          'test.bob',
          '0',
          'ether',
          test.bob.address);

        assertBNEquals (
          'test.justPriceProtocolWrapper.getStage (1562544000)',
          4, // LIFE
          test.justPriceProtocolWrapper.getStage (1562544000));

        assertBNEquals (
          'test.justPriceProtocolWrapper.outstandingTokens (test.bob.address)',
          '0',
          test.justPriceProtocolWrapper.outstandingTokens (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.eligibleVotes (test.bob.address)',
          '511847934914180963',
          test.justPriceProtocolWrapper.eligibleVotes (test.bob.address));

        assertBNEquals (
          'test.justPriceProtocolWrapper.totalEligibleVotes ()',
          '511847934914180963',
          test.justPriceProtocolWrapper.totalEligibleVotes ());
      }}
  ]});
