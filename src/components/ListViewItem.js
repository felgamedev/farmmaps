import React from 'react'

const ListViewItem = (props) => {
  return (
    <div className={"list-view-item" + (props.selected ? " selected" : "")} onClick={() => props.selectLocation(props.location)}>{props.location.title}</div>
  )
}

export default ListViewItem;
