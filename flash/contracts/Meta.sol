pragma solidity = 0.7.6;
pragma abicoder v2;

contract Meta {
    constructor() {}

    event GotData(address);

    function getValue() public {
        emit GotData(msg.sender);
    }
}