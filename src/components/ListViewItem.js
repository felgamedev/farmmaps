import React from 'react'

const ListViewItem = (props) => {
  return (
    <div tabIndex="0" onFocus={() => props.selectLocation(props.location)} onClick={() => props.selectLocation(props.location)} className={"list-view-item" + (props.selected ? " selected" : "")}>{props.location.title}</div>
  )
}

export default ListViewItem;
