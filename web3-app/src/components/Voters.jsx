import Identicon from 'react-identicons'
import moment from 'moment'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { truncate } from '../store'
import { listVoters } from '../Blockchain.services'

const deactive =
  'bg-transparent text-blue-600 font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-600 transition duration-150 ease-in-out overflow-hidden border border-blue-600 hover:text-white focus:text-white'
const active =
  'bg-blue-600 text-white font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-800 transition duration-150 ease-in-out overflow-hidden border border-blue-600'

const Voters = () => {
  const [voters, setVoters] = useState([])
  const [data, setData] = useState([])
  const [tab, setTab] = useState('all')
  const { id } = useParams()

  const timeAgo = (timestamp) => moment(Number(timestamp + '000')).fromNow()

  useEffect(() => {
    const load = async () => {
      const res = (await listVoters(id)) || []
      setVoters(res)
      setData(res)
    }
    load()
  }, [id])

  const getAll = () => { setTab('all'); setVoters(data) }
  const getAccepted = () => { setTab('acc'); setVoters(data.filter((vote) => vote.choosen)) }
  const getRejected = () => { setTab('rej'); setVoters(data.filter((vote) => !vote.choosen)) }

  return (
    <div className="flex flex-col p-8">
      <div className="flex flex-row justify-center items-center" role="group">
        <button className={`rounded-l-full px-6 py-2.5 ${tab === 'all' ? active : deactive}`} onClick={getAll}>
          All
        </button>
        <button className={`px-6 py-2.5 ${tab === 'acc' ? active : deactive}`} onClick={getAccepted}>
          Acceptees
        </button>
        <button className={`rounded-r-full px-6 py-2.5 ${tab === 'rej' ? active : deactive}`} onClick={getRejected}>
          Rejectees
        </button>
      </div>
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
          <div className="h-[calc(100vh_-_20rem)] overflow-y-auto shadow-md rounded-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  {['Voter', 'Voted', 'Vote'].map((h) => (
                    <th key={h} scope="col" className="text-sm font-medium px-6 py-4 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {voters.map((voter, i) => (
                  <tr key={i} className="border-b dark:border-gray-500 transition duration-300 ease-in-out">
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-row justify-start items-center space-x-3">
                        <Identicon
                          string={voter.voter.toLowerCase()}
                          size={25}
                          className="h-10 w-10 object-contain rounded-full mr-3"
                        />
                        <span>{truncate(voter.voter, 4, 4, 11)}</span>
                      </div>
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {timeAgo(voter.timestamp)}
                    </td>
                    <td className="text-sm font-light px-6 py-4 whitespace-nowrap">
                      {voter.choosen ? (
                        <button className="border-2 rounded-full px-6 py-2.5 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase">
                          Accepted
                        </button>
                      ) : (
                        <button className="border-2 rounded-full px-6 py-2.5 border-red-600 text-red-600 font-medium text-xs leading-tight uppercase">
                          Rejected
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Voters
