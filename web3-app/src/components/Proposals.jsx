import Identicon from 'react-identicons'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { truncate, useGlobalState, daysRemaining } from '../store'
import { payoutBeneficiary } from '../Blockchain.services'
import { toast } from 'react-toastify'

const deactive =
  'bg-transparent text-blue-600 font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-600 transition duration-150 ease-in-out overflow-hidden border border-blue-600 hover:text-white focus:text-white'
const active =
  'bg-blue-600 text-white font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-800 transition duration-150 ease-in-out overflow-hidden border border-blue-600'

// Tailwind JIT can class day du (khong noi chuoi dong) de khong bi loai bo khi build
const PILLS = {
  blue: 'dark:border rounded-full px-6 py-2.5 dark:border-blue-600 dark:text-blue-600 dark:bg-transparent font-medium text-xs leading-tight uppercase hover:border-blue-700 focus:border-blue-700 focus:outline-none focus:ring-0 active:border-blue-800 transition duration-150 ease-in-out text-white bg-blue-600',
  red: 'dark:border rounded-full px-6 py-2.5 dark:border-red-600 dark:text-red-600 dark:bg-transparent font-medium text-xs leading-tight uppercase hover:border-red-700 focus:border-red-700 focus:outline-none focus:ring-0 active:border-red-800 transition duration-150 ease-in-out text-white bg-red-600',
  green: 'dark:border rounded-full px-6 py-2.5 dark:border-green-600 dark:text-green-600 dark:bg-transparent font-medium text-xs leading-tight uppercase hover:border-green-700 focus:border-green-700 focus:outline-none focus:ring-0 active:border-green-800 transition duration-150 ease-in-out text-white bg-green-600',
}
const pill = (color) => PILLS[color]

const isExpired = (p) => new Date().getTime() > Number(p.duration + '000')

// Trang thai: Pending / Passed / Not Passed / Paid
const statusOf = (p) => {
  if (p.paid) return 'Paid'
  if (!isExpired(p)) return 'Pending'
  return p.upvotes > p.downvotes ? 'Passed' : 'Not Passed'
}

const Proposals = () => {
  const [data] = useGlobalState('proposals')
  const [isStakeholder] = useGlobalState('isStakeholder')
  const [proposals, setProposals] = useState(data)
  const [tab, setTab] = useState('all')

  const getAll = () => { setTab('all'); setProposals(data) }
  const getOpened = () => { setTab('open'); setProposals(data.filter((p) => !isExpired(p))) }
  const getClosed = () => { setTab('closed'); setProposals(data.filter((p) => isExpired(p))) }

  const handlePayout = async (proposal) => {
    const ok = await payoutBeneficiary(proposal.id)
    if (ok) {
      toast.success(
        `Payout thành công! ${proposal.amount} ETH đã gửi đến ${truncate(proposal.beneficiary, 5, 3, 11)}`,
      )
      setTimeout(() => window.location.reload(), 2500)
    } else {
      toast.error('Payout thất bại (chưa đủ phiếu, đã thanh toán hoặc quỹ không đủ).')
    }
  }

  return (
    <div className="flex flex-col p-8">
      <div className="flex flex-row justify-center items-center" role="group">
        <button className={`rounded-l-full px-6 py-2.5 ${tab === 'all' ? active : deactive}`} onClick={getAll}>
          All
        </button>
        <button className={`px-6 py-2.5 ${tab === 'open' ? active : deactive}`} onClick={getOpened}>
          Open
        </button>
        <button className={`rounded-r-full px-6 py-2.5 ${tab === 'closed' ? active : deactive}`} onClick={getClosed}>
          Closed
        </button>
      </div>
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  {['Created By', 'Title', 'Amount', 'Votes', 'Expires', 'Status', 'Action'].map((h) => (
                    <th key={h} scope="col" className="text-sm font-medium px-6 py-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => {
                  const expired = isExpired(proposal)
                  const passed = proposal.upvotes > proposal.downvotes
                  return (
                    <tr key={proposal.id} className="border-b dark:border-gray-500">
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-row justify-start items-center space-x-3">
                          <Identicon
                            string={proposal.proposer.toLowerCase()}
                            size={25}
                            className="h-10 w-10 object-contain rounded-full mr-3"
                          />
                          <span>{truncate(proposal.proposer, 4, 4, 11)}</span>
                        </div>
                      </td>
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        {proposal.title.length > 40 ? proposal.title.substring(0, 40) + '...' : proposal.title}
                      </td>
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">{proposal.amount} ETH</td>
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        👍 {proposal.upvotes} / 👎 {proposal.downvotes}
                      </td>
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                        {expired ? 'Expired' : daysRemaining(proposal.duration)}
                      </td>
                      <td className="text-sm font-light px-6 py-4 whitespace-nowrap">{statusOf(proposal)}</td>
                      <td className="flex justify-start items-center space-x-3 text-sm font-light px-6 py-4 whitespace-nowrap">
                        <Link to={'/proposal/' + proposal.id} className={pill('blue')}>
                          View
                        </Link>

                        {expired ? (
                          passed ? (
                            !proposal.paid ? (
                              isStakeholder ? (
                                <button className={pill('red')} onClick={() => handlePayout(proposal)}>
                                  Payout
                                </button>
                              ) : null
                            ) : (
                              <button className={pill('green')}>Paid</button>
                            )
                          ) : (
                            <button className={pill('red')}>Rejected</button>
                          )
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Proposals
