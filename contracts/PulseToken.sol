// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PulseToken
/// @notice A simple ERC-20 token used to demonstrate the Open PulseChain
///         development environment end to end.
contract PulseToken is ERC20, Ownable {
    constructor(uint256 initialSupply)
        ERC20("Open PulseChain Token", "OPLS")
        Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mint new tokens. Restricted to the contract owner.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
