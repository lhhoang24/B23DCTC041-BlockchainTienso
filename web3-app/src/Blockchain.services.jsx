import Web3 from 'web3'
import { setGlobalState, getGlobalState } from './store'
import abi from './abis/DominionDAO.json'

const { ethereum } = window
window.web3 = new Web3(ethereum)
window.web3 = new Web3(window.web3.currentProvider)

const MISSING_METAMASK = 'Vui lòng cài MetaMask'

// Chi cho phep giao dich tren Sepolia (tranh gui ETH that tren Ethereum Mainnet)
const SEPOLIA_CHAIN_ID = '0xaa36a7'
const ensureSepolia = async () => {
  if (!ethereum) {
    alert(MISSING_METAMASK)
    return false
  }
  const chainId = await ethereum.request({ method: 'eth_chainId' })
  if (chainId === SEPOLIA_CHAIN_ID) return true
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    })
  } catch (e) {
    alert('Vui lòng chuyển MetaMask sang mạng Sepolia trước khi giao dịch.')
  }
  return false
}

const connectWallet = async () => {
  try {
    if (!ethereum) return alert(MISSING_METAMASK)
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setGlobalState('connectedAccount', accounts[0].toLowerCase())
  } catch (error) {
    reportError(error)
  } finally {
    window.location.reload()
  }
}

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert(MISSING_METAMASK)
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    // Doi mang hoac doi tai khoan -> reload lai trang thai
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', async () => {
      window.location.reload()
    })

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0].toLowerCase())
    } else {
      alert('Please connect wallet.')
      console.log('No accounts found.')
    }
  } catch (error) {
    reportError(error)
  }
}

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState('connectedAccount')

  if (connectedAccount) {
    const web3 = window.web3
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
    const contract = new web3.eth.Contract(Array.isArray(abi) ? abi : abi.abi, contractAddress)
    return contract
  } else {
    return getGlobalState('contract')
  }
}

// Dong gop ETH vao quy DAO
const performContribute = async (amount) => {
  try {
    if (!(await ensureSepolia())) return false
    amount = window.web3.utils.toWei(amount.toString(), 'ether')
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')

    await contract.methods.contribute().send({ from: account, value: amount })
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const getInfo = async () => {
  try {
    if (!ethereum) return alert(MISSING_METAMASK)

    const contract = await getEtheriumContract()
    const connectedAccount = getGlobalState('connectedAccount')
    const isStakeholder = await contract.methods
      .isStakeholder()
      .call({ from: connectedAccount })
    const balance = await contract.methods.daoBalance().call()
    const mybalance = await contract.methods
      .getBalance()
      .call({ from: connectedAccount })
    setGlobalState('balance', window.web3.utils.fromWei(balance))
    setGlobalState('mybalance', window.web3.utils.fromWei(mybalance))
    setGlobalState('isStakeholder', isStakeholder)
  } catch (error) {
    reportError(error)
  }
}

// Tao de xuat chi tien
const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  try {
    if (!(await ensureSepolia())) return false
    amount = window.web3.utils.toWei(amount.toString(), 'ether')
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')

    await contract.methods
      .createProposal(title, description, beneficiary, amount)
      .send({ from: account })
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const getProposals = async () => {
  try {
    if (!ethereum) return alert(MISSING_METAMASK)

    const contract = await getEtheriumContract()
    const proposals = await contract.methods.getProposals().call()
    setGlobalState('proposals', structuredProposals(proposals))
  } catch (error) {
    reportError(error)
  }
}

const structuredProposals = (proposals) => {
  return proposals
    .map((proposal) => ({
      id: proposal.id,
      amount: window.web3.utils.fromWei(proposal.amount),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse()
}

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState('proposals')
    return proposals.find((proposal) => proposal.id == id)
  } catch (error) {
    reportError(error)
  }
}

// Bo phieu: supported = true (ACCEPT) / false (REJECT)
const voteOnProposal = async (proposalId, supported) => {
  try {
    if (!(await ensureSepolia())) return false
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')
    await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account })
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract()
    const votes = await contract.methods.getVotesOf(id).call()
    return votes
  } catch (error) {
    reportError(error)
  }
}

// Thanh toan cho beneficiary. Tra ve true neu thanh cong (UI se tu hien thong bao roi reload)
const payoutBeneficiary = async (id) => {
  try {
    if (!(await ensureSepolia())) return false
    const contract = await getEtheriumContract()
    const account = getGlobalState('connectedAccount')
    await contract.methods.payBeneficiary(id).send({ from: account })
    return true
  } catch (error) {
    reportError(error)
    return false
  }
}

const reportError = (error) => {
  console.log(JSON.stringify(error), 'red')
}

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
}
