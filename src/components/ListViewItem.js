import React from 'react'

const ListViewItem = (props) => {

  return (
    <div tabIndex="0" onClick={() => props.selectLocation(props.location, false)} onFocus={() => props.selectLocation(props.location, true)} className={"list-view-item" + (props.selected ? " selected" : "")}>{props.location.title}</div>
  )
}

export default ListViewItem;
