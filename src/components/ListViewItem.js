import React from 'react'

const ListViewItem = (props) => {

  return (
    <div tabIndex="0" onFocus={(e) => props.onListViewFocused(props.location, e)} onMouseDown={(e) => props.onListViewFocused(props.location, e)} className={"list-view-item" + (props.selected ? " selected" : "")}>{props.location.title}</div>
  )
}

export default ListViewItem;
