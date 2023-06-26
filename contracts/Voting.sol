//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voting is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private counter;

    IERC20 public USDT;

    uint256 public TOKEN_FEES;

    struct Project {
        string name;
        uint256 ID;
        uint256 totalVotes;
        mapping(address => bool) hasVoted;
        mapping(address => Vote) voteDetails;
        Vote[] votes;
    }

    struct Vote {
        address voter;
        uint256 date;
    }

    struct Voter {
        uint256 freeVoteTimestamp;
        uint256 freeVoteCount;
        uint256 totalVotes;
        address voter;
    }

    mapping(uint256 => Project) public projectDetails;
    mapping(address => Voter) public voterDetails;
    mapping(uint256 => bool) public validProject;

    modifier castVoteCheck(uint256 _projectID) {
        require(validProject[_projectID], "Invalid project ID");
        require(
            !projectDetails[_projectID].hasVoted[msg.sender],
            "User has already voted"
        );
        _;
    }

    event projectRegistered(string _name, uint256 _projectID, uint256 _date);
    event voteCasted(address _voter, uint256 _projectID, uint256 _date);

    /**
     * @notice Constructor for the contract.
     * @param _usdt Address of the USDT contract that we are using.
     * @param _tokenFees Value for the token fees.
     */
    constructor(address _usdt, uint256 _tokenFees) {
        USDT = IERC20(_usdt);
        TOKEN_FEES = _tokenFees;
    }

    /**
     * @dev Allows only contract owner to register a project with a given name provided in _name param.
     * @param _name - Name of the project
     */
    function registerProject(string memory _name) external onlyOwner {
        uint256 ID = counter.current();
        validProject[ID] = true;
        projectDetails[ID].name = _name;
        projectDetails[ID].ID = ID;
        counter.increment();
        emit projectRegistered(_name, ID, block.timestamp);
    }

    /**
     * @dev Allows voter to cast a vote upon verifying the the voting conditons.
     * @param _projectID - ID of the project for which the vote is requested.
     */
    function castVote(uint256 _projectID) external castVoteCheck(_projectID) {
        _castVote(_projectID);
    }

    function _castVote(uint256 _projectID) private {
        uint256 freeVoteCount = voterDetails[msg.sender].freeVoteCount;
        voterDetails[msg.sender].totalVotes += 1;
        projectDetails[_projectID].totalVotes += 1;

        if (freeVoteCount == 0) {
            voterDetails[msg.sender].freeVoteTimestamp = block.timestamp;
        } else if (freeVoteCount > 0) {
            if (
                voterDetails[msg.sender].freeVoteTimestamp + 30 days <
                block.timestamp
            ) {
                voterDetails[msg.sender].freeVoteCount = 0;
                voterDetails[msg.sender].freeVoteTimestamp = block.timestamp;
            } else if (
                voterDetails[msg.sender].freeVoteTimestamp + 30 days >=
                block.timestamp &&
                freeVoteCount >= 3
            ) {
                USDT.transferFrom(msg.sender, address(this), TOKEN_FEES);
            }
        }
        voterDetails[msg.sender].freeVoteCount += 1;
        voterDetails[msg.sender].voter = msg.sender;
        projectDetails[_projectID].hasVoted[msg.sender] = true;
        projectDetails[_projectID].voteDetails[msg.sender].voter = msg.sender;
        projectDetails[_projectID].voteDetails[msg.sender].date = block
            .timestamp;

        emit voteCasted(msg.sender, _projectID, block.timestamp);
    }

    /**
     * @dev This function allows the owner to withdraw fees from the contract.
     */
    function withdrawFees() external onlyOwner {
        require(USDT.balanceOf(address(this)) > 0, "Insufficient balance");
        USDT.transfer(owner(), USDT.balanceOf(address(this)));
    }

    /**
     * @dev This function allows the owner to update the token fees.
     * @param _tokenFees: the new token fees value
     */
    function updateTokenFees(uint256 _tokenFees) external onlyOwner {
        require(TOKEN_FEES != _tokenFees, "Duplicate token fees");
        TOKEN_FEES = _tokenFees;
    }
}
