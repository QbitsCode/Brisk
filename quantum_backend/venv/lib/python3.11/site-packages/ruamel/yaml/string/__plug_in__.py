# coding: utf-8

import io

from typing import Any
from ruamel.yaml import YAML

typ = 'string'


class DumpToString:
    def __init__(self, yaml: YAML) -> None:
        self.yaml = yaml

    def __call__(self, data: Any, add_final_eol: bool = False) -> str:
        buf = io.BytesIO()
        self.yaml.dump(data, buf)
        if add_final_eol:
            return buf.getvalue().decode('utf-8')
        else:
            return buf.getvalue()[:-1].decode('utf-8')


def init_typ(self: YAML) -> None:
    # add the new methods
    self.dump_to_string = self.dumps = DumpToString(self)  # type: ignore
