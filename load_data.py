# load_data.py - 从 YAML 文件加载历史事件数据
import yaml
import os

def load_events():
    """加载 events.yaml 文件中的所有历史事件数据"""
    yaml_path = os.path.join(os.path.dirname(__file__), 'events.yaml')
    with open(yaml_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

# 全局变量，避免重复加载
EVENTS_DB = load_events()
