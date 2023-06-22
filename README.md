# Voting contract

This smart contract implements a voting system where users can cast votes for listed projects. It uses the OpenZeppelin Counters, Ownable and IERC20 contracts to provide a secure voting platform.

# Smart contract details

### Structs:

- **`Project`:** This struct contains the name of the project, its ID and the total amount of votes for the project. The mapping **`hasVoted`** tracks whether a user has already voted for the project, while the mapping **`voteDetails`** stores the identity and date of each individual vote.

- **`Vote`:** This struct stores the voter's address and the date of the vote.

- **`Voter`:** This struct tracks each voter's total number of votes, including the date of their last free Vote and how many free Votes have been cast.

### Mappings:

- **`projectDetails`**: This mapping stores each project's details.
- **`voterDetails`**: This mapping stores each voter's details.
- **`validProject`**: This mapping tracks which projects are valid to cast a vote for.

### Events:

- **`projectRegistered`**: Fired when a project is registered. Emits the name, ID and date of the project.
- **`voteCasted`**: Fired when a vote is cast. Emits the address of the voter, ID of the project voted for and date of the vote.

### Contsructor

- The contract's constructor takes two parameters, the address of the ERC20 token to be used for payments and the token fees, which will be charged when the user has casted more than three free votes in 30 days.

### Methods

- **`registerProject()`**: This method allows the owner to register a new project to the platform.

- **`castVote()`**: This method allows users to cast their votes for a listed project, provided they have not already done so. Additionally, if the user has cast more than three free votes in the last 30 days, they will be required to pay the token fees.

- **`The _castVote()`**: This method is a private helper method to facilitate the casting of a vote.

- **`withdrawFees()`**: This method allows the owner to withdraw fees collected by the contract.

- **`updateTokenFees()`**: This method allows the owner to update the token fees charged by the contract.

### Assumptions:

1. The owner of the contract is the only one who can register a new project to vote on.
2. The owner of the contract is able to change the token fee using the **`updateTokenFees()`** method at any time.
3. The time period of a month for each user’s voting will start from their first vote and will be tracked accordingly.
4. After the free votes for the month have been used, the user must pay a certain amount of fees in ERC20 tokens, which I have assumed to use USDT for.

## Quick Start

To get started, clone this repository and install its dependencies with the following commands:

```sh
git clone https://github.com/rahulthakkar796/voting.git
cd voting
npm install
```

Once installed, you can run unit tests using:

```sh
npx hardhat test
```

To deploy the contract to a local Hardhat node:

```sh
npx hardhat run scripts/deploy.ts
```

To deploy the contract to the Ethereum mainnet:

```sh
npx hardhat run scripts/deploy.ts --network eth_main
```

Alternatively, you can deploy the contract to any EVM chain defined in the `hardhat.config.ts` file by running:

```sh
npx hardhat run scripts/deploy.ts --network defined_network
```
