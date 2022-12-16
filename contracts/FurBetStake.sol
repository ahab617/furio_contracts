// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./abstracts/BaseContract.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// Interfaces.
import "./interfaces/IFurBetToken.sol";

/**
 * @title FurbetStake
 * @notice This is the staking contract for Furbet
 */

/// @custom:security-contact security@furio.io
contract FurBetStake is BaseContract, ERC721Upgradeable
{
    /**
     * Contract initializer.
     * @dev This intializes all the parent contracts.
     */
    function initialize() initializer public
    {
        __BaseContract_init();
        __ERC721_init("FurBetStake", "$FURBS");
        _periods[0] = block.timestamp;
        _periods[1] = 1669852800; // 12:00:00 AM on December 1, 2022 GMT+0000
        _periods[2] = 1677628800; // 12:00:00 AM on March 1, 2023 GMT+0000
        _periods[3] = 1685577600; // 12:00:00 AM on June 1, 2023 GMT+0000
        _periods[4] = 1693526400; // 12:00:00 AM on September 1, 2023 GMT+0000
        _periodTracker = 4;
    }

    /**
     * Properties.
     */
    uint256 private _periodTracker; // Keeps track of staking periods.
    uint256 private _tokenTracker; // Keeps track of staking tokens.

    /**
     * Mappings.
     */
    mapping (uint256 => uint256) private _periods; // Maps period to end timestamp.
    mapping (uint256 => uint256) private _totalStake; // Maps period to total staked.
    mapping (uint256 => uint256) private _tokens; // Maps token id to staking period.
    mapping (uint256 => uint256) private _tokenAmount; // Maps token id to staked amount.
    mapping (uint256 => uint256) private _tokenEntryDate; // Maps token id to entry date.

    /**
     * Stake.
     * @param period_ Staking period.
     * @param amount_ Staking amount.
     */
    function stake(uint256 period_, uint256 amount_) external
    {
        IFurBetToken _token_ = IFurBetToken(addressBook.get("furbettoken"));
        require(_token_.transferFrom(msg.sender, address(this), amount_), "Failed to transfer tokens");
        _stake(msg.sender, period_, amount_);
    }

    /**
     * Stake for.
     * @param participant_ Participant address.
     * @param period_ Staking period.
     * @param amount_ Staking amount.
     */
    function stakeFor(address participant_, uint256 period_, uint256 amount_) external
    {
        IFurBetToken _token_ = IFurBetToken(addressBook.get("furbettoken"));
        require(_token_.transferFrom(msg.sender, address(this), amount_), "Failed to transfer tokens");
        _stake(participant_, period_, amount_);
    }

    /**
     * Internal stake.
     * @param participant_ Participant address.
     * @param period_ Staking period.
     * @param amount_ Staking amount.
     */
    function _stake(address participant_, uint256 period_, uint256 amount_) internal
    {
        require(_periods[period_] > 0 && _periods[period_] <= block.timestamp, "Period is not active");
        _tokenTracker ++;
        _tokens[_tokenTracker] = period_;
        _tokenAmount[_tokenTracker] = amount_;
        _tokenEntryDate[_tokenTracker] = block.timestamp;
        _totalStake[period_] += amount_;
        _mint(participant_, _tokenTracker);
    }

    /**
     * Value.
     * @param token_ Token id.
     * @return uint256 Token value.
     */
    function value(uint256 token_) internal view returns (uint256)
    {
        return _tokenAmount[token_];
    }

    /**
     * Staked.
     * @param participant_ Participant address.
     * @return uint256 Amount staked.
     */
    function staked(address participant_) external view returns (uint256)
    {
        uint256 _staked_ = 0;
        for(uint256 i = 1; i <= _tokenTracker; i ++) {
            if(super.ownerOf(i) == participant_) {
                _staked_ += _tokenAmount[i];
            }
        }
        return _staked_;
    }

    /**
     * Disable transfers for now.
     * @param from From address.
     * @param to To address.
     * @param tokenId Token id.
     */
    function _transfer(address from, address to, uint256 tokenId) internal pure override {
        require(true == false, "Transfers are disabled");
    }
}
