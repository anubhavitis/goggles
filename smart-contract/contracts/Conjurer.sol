// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Conjurer {
    // State variables
    address public owner;
    mapping(address => uint256) public userCredits;
    uint256 public creditPrice = 0.0001 ether; // Price per credit in wei
    
    // Events
    event CreditsPurchased(address indexed user, uint256 amount, uint256 credits);
    event CreditsDecreased(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Function to buy credits using native tokens
    function buyCredits() public payable validAmount(msg.value) {
        uint256 credits = msg.value / creditPrice;
        require(credits > 0, "Insufficient payment for credits");
        
        userCredits[msg.sender] += credits;
        
        emit CreditsPurchased(msg.sender, msg.value, credits);
    }
    
    // Function to read user's credit balance
    function getCredits(address user) public view returns (uint256) {
        return userCredits[user];
    }
    
    // Function for owner to decrease user's credits
    function decreaseCredits(address user, uint256 amount) public onlyOwner validAmount(amount) {
        require(userCredits[user] >= amount, "Insufficient credits");
        
        userCredits[user] -= amount;
        
        emit CreditsDecreased(user, amount);
    }
    
    // Function for owner to withdraw funds
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, balance);
    }
    
    // Function to update credit price (only owner)
    function setCreditPrice(uint256 newPrice) public onlyOwner validAmount(newPrice) {
        creditPrice = newPrice;
    }
    
    // Function to get contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Fallback function to receive ether
    receive() external payable {
        // Allow direct ether transfers to the contract
    }
}