import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div>
        <div className="container">
            <ul className="nav-list">
                <li>
                    <Link to={'/'}>Home</Link>
                </li>
            </ul>
        </div>
    </div>
  )
}

export default Header