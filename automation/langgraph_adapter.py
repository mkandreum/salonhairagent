#!/usr/bin/env python3
"""
LangGraph adapter for triage results.
Simulates integration with LangGraph for state management and persistence.
"""
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

class LangGraphStore:
    """Simulated LangGraph store for ticket triage results."""
    
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or os.environ.get(
            "LANGGRAPH_STORE", 
            os.path.join(os.getcwd(), "storage", "langgraph")
        )
        self.graphs = {}
        self._ensure_structure()
    
    def _ensure_structure(self):
        """Ensure the storage directory structure exists."""
        Path(self.base_dir).mkdir(parents=True, exist_ok=True)
    
    def create_graph(self, graph_id: str, config: Dict[str, Any] = None) -> str:
        """Create a new LangGraph instance."""
        graph_path = Path(self.base_dir) / graph_id
        graph_path.mkdir(exist_ok=True)
        
        graph_config = {
            "id": graph_id,
            "created_at": datetime.utcnow().isoformat(),
            "config": config or {},
            "state": {
                "nodes": [],
                "edges": [],
                "current_state": "initialized"
            }
        }
        
        config_file = graph_path / "config.json"
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(graph_config, f, indent=2)
        
        self.graphs[graph_id] = graph_config
        return graph_id
    
    def add_node(self, graph_id: str, node_type: str, data: Dict[str, Any]) -> str:
        """Add a node to a LangGraph."""
        node_id = str(uuid.uuid4())
        
        graph_path = Path(self.base_dir) / graph_id
        nodes_path = graph_path / "nodes"
        nodes_path.mkdir(exist_ok=True)
        
        node_data = {
            "id": node_id,
            "type": node_type,
            "data": data,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": {
                "version": "1.0",
                "source": "ticket-triage-mvp"
            }
        }
        
        node_file = nodes_path / f"{node_id}.json"
        with open(node_file, "w", encoding="utf-8") as f:
            json.dump(node_data, f, indent=2)
        
        # Update graph state
        if graph_id in self.graphs:
            self.graphs[graph_id]["state"]["nodes"].append(node_id)
        
        return node_id
    
    def add_edge(self, graph_id: str, source_id: str, target_id: str, edge_type: str = "flows_to") -> str:
        """Add an edge between nodes in a LangGraph."""
        edge_id = str(uuid.uuid4())
        
        graph_path = Path(self.base_dir) / graph_id
        edges_path = graph_path / "edges"
        edges_path.mkdir(exist_ok=True)
        
        edge_data = {
            "id": edge_id,
            "source": source_id,
            "target": target_id,
            "type": edge_type,
            "created_at": datetime.utcnow().isoformat()
        }
        
        edge_file = edges_path / f"{edge_id}.json"
        with open(edge_file, "w", encoding="utf-8") as f:
            json.dump(edge_data, f, indent=2)
        
        # Update graph state
        if graph_id in self.graphs:
            self.graphs[graph_id]["state"]["edges"].append(edge_id)
        
        return edge_id
    
    def update_state(self, graph_id: str, new_state: str, metadata: Dict[str, Any] = None) -> bool:
        """Update the current state of a LangGraph."""
        if graph_id not in self.graphs:
            return False
        
        state_path = Path(self.base_dir) / graph_id / "state.json"
        state_data = {
            "graph_id": graph_id,
            "current_state": new_state,
            "previous_state": self.graphs[graph_id]["state"]["current_state"],
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        with open(state_path, "w", encoding="utf-8") as f:
            json.dump(state_data, f, indent=2)
        
        self.graphs[graph_id]["state"]["current_state"] = new_state
        return True

def write_to_store(project_id: str, data: object, base_dir: str = None) -> str:
    """
    Write triage results to LangGraph store.
    Creates a graph node for each classification result.
    """
    store = LangGraphStore(base_dir)
    
    # Ensure graph exists for this project
    graph_id = f"triage-{project_id}"
    if graph_id not in store.graphs:
        store.create_graph(graph_id, {
            "purpose": "ticket_triage_classification",
            "project": project_id,
            "version": "1.0"
        })
    
    # Create a node for the data
    node_id = store.add_node(graph_id, "classification_result", {
        "data": data,
        "source": "ticket-triage-api",
        "processed_at": datetime.utcnow().isoformat()
    })
    
    # Update graph state to show processing completed
    store.update_state(graph_id, "result_stored", {
        "node_id": node_id,
        "data_type": "classification"
    })
    
    return f"langgraph://{graph_id}/nodes/{node_id}"

def get_store_stats(base_dir: str = None) -> Dict[str, Any]:
    """Get statistics about the LangGraph store."""
    store = LangGraphStore(base_dir)
    
    total_graphs = len(store.graphs)
    total_nodes = 0
    total_edges = 0
    
    for graph_id in store.graphs:
        graph_path = Path(store.base_dir) / graph_id
        nodes_path = graph_path / "nodes"
        edges_path = graph_path / "edges"
        
        if nodes_path.exists():
            total_nodes += len(list(nodes_path.glob("*.json")))
        if edges_path.exists():
            total_edges += len(list(edges_path.glob("*.json")))
    
    return {
        "total_graphs": total_graphs,
        "total_nodes": total_nodes,
        "total_edges": total_edges,
        "store_path": store.base_dir,
        "graphs": list(store.graphs.keys())
    }
