import { useState, useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { ethers } from "ethers";
const { formatEther, parseEther } = ethers.utils;

import PonziABI from "../abi/Ponzi.json";
const PonziAddress = "0x933033cb97Df7fb4b32453b4aaa6776C4dC8Cee0";

function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [ponziBalance, setPonziBalance] = useState("");
  const [etherBalance, setEtherBalance] = useState("");
  const [contractEtherBalance, setContractEtherBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        window.ethereum.on("accountsChanged", accountsChanged);
        window.ethereum.on("chainChanged", chainChanged);
        accountsChanged(accounts);
        chainChanged(window.ethereum.chainId);
      } catch (error) {
        setAccount("");
        setMessage(error.message);
      }
    } else {
      setAccount("");
      setMessage("Browser wallet required");
    }
  };

  const accountsChanged = (accounts) => {
    setAccount(accounts[0]);
    setMessage("");
  };

  const chainChanged = (chain) => {
    setChainId(chain);
    if (chain != "0x5") setMessage("Please select Goerli network");
    else setMessage("");
  };

  const getPonziBalance = async () => {
    if (account && chainId == "0x5") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const ponzi = new ethers.Contract(PonziAddress, PonziABI, provider);
      const balance = await ponzi.balanceOf(account);
      setPonziBalance(formatEther(balance));
    } else {
      setPonziBalance("");
    }
  };

  const getEtherBalance = async () => {
    if (account && chainId == "0x5") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      setEtherBalance(formatEther(balance));
    } else {
      setEtherBalance("");
    }
  };

  const getContractEtherBalance = async () => {
    if (account && chainId == "0x5") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(PonziAddress);
      setContractEtherBalance(formatEther(balance));
    } else {
      setContractEtherBalance("");
    }
  };

  useEffect(() => {
    getPonziBalance();
    getEtherBalance();
    getContractEtherBalance();
  }, [account, chainId]);

  const deposit = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ponzi = new ethers.Contract(PonziAddress, PonziABI, signer);
      const tx = await ponzi.deposit({ value: parseEther(amount) });
      await tx.wait();
    } catch (error) {
      setMessage(error.code);
    }
  };

  const withdraw = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ponzi = new ethers.Contract(PonziAddress, PonziABI, signer);
      const tx = await ponzi.withdraw(parseEther(amount));
      await tx.wait();
    } catch (error) {
      setMessage(error.code);
    }
  };

  const withdrawAll = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ponzi = new ethers.Contract(PonziAddress, PonziABI, signer);
      const tx = await ponzi.withdrawAll();
      await tx.wait();
    } catch (error) {
      setMessage(error.code);
    }
  };

  return (
    <Box textAlign="center" mx="auto" my="3" maxW="800px" p="3" boxShadow="xl">
      <Box my="3" textAlign="right">
        <Button onClick={connect}>Connect</Button>
      </Box>
      <Box my="3" textAlign="left">
        Project description at{" "}
        <a href="https://github.com/therandomchoice/ponzi" target="_blank">
          https://github.com/therandomchoice/ponzi
        </a>
      </Box>
      <Box my="3" textAlign="left">
        Site sources at{" "}
        <a
          href="https://github.com/therandomchoice/ponzi-frontend"
          target="_blank"
        >
          https://github.com/therandomchoice/ponzi-frontend
        </a>
      </Box>
      <Table>
        <Tbody>
          <Tr>
            <Th>Account</Th>
            <Td colSpan="2">{account}</Td>
          </Tr>
          <Tr>
            <Th>Ponzi balance</Th>
            <Td>{ponziBalance}</Td>
            <Td>
              <Button size="xs" onClick={() => setAmount(ponziBalance)}>
                Set Max Ponzi
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Th>Ether balance</Th>
            <Td>{etherBalance}</Td>
            <Td>
              <Button size="xs" onClick={() => setAmount(etherBalance)}>
                Set Max Ether
              </Button>
            </Td>
          </Tr>
          <Tr>
            <Th>Contract address</Th>
            <Td colSpan="2">{PonziAddress}</Td>
          </Tr>
          <Tr>
            <Th>Contract ether balance</Th>
            <Td colSpan="2">{contractEtherBalance}</Td>
          </Tr>
        </Tbody>
      </Table>
      <NumberInput
        mx="1"
        my="3"
        defaultValue={0}
        min={0}
        step={0.01}
        allowMouseWheel
        value={amount}
        onChange={(value) => setAmount(value)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <ButtonGroup>
        <Button onClick={deposit}>Deposit (Ether to Ponzi)</Button>
        <Button onClick={withdraw}>Withdraw (Ponzi to Ether)</Button>
        <Button onClick={withdrawAll}>Withdraw all (all Ponzi to Ether)</Button>
      </ButtonGroup>
      {message ? (
        <Box my="3" p="2" bg="red.100">
          {message}
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default App;
